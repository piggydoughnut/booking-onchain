import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Deploy MembershipManager
  const pricePerPeriod = ethers.parseUnits(
    process.env.MEMBERSHIP_PRICE_PER_30DAYS || "1",
    18
  );
  const durationPerPeriod = 30n * 24n * 60n * 60n; // 30 days in seconds

  const Membership = await ethers.getContractFactory("MembershipManager");
  const membership = await Membership.deploy(
    pricePerPeriod,
    Number(durationPerPeriod)
  );
  await membership.waitForDeployment();
  console.log("MembershipManager:", await membership.getAddress());

  // Deploy ListingManager
  const Listing = await ethers.getContractFactory("ListingManager");
  const listing = await Listing.deploy();
  await listing.waitForDeployment();
  console.log("ListingManager:", await listing.getAddress());

  // Deploy BookingManager
  const Booking = await ethers.getContractFactory("BookingManager");
  const booking = await Booking.deploy(
    await membership.getAddress(),
    await listing.getAddress()
  );
  await booking.waitForDeployment();
  console.log("BookingManager:", await booking.getAddress());

  // Wire ListingManager -> BookingManager
  const tx = await listing.setBookingManager(await booking.getAddress());
  await tx.wait();

  // Deploy optional AccessNFT and set it on BookingManager
  const Access = await ethers.getContractFactory("AccessNFT");
  const access = await Access.deploy();
  await access.waitForDeployment();
  console.log("AccessNFT:", await access.getAddress());
  await (await access.transferOwnership(await booking.getAddress())).wait();
  await (await booking.setAccessNft(await access.getAddress())).wait();

  console.log("Verifying deployments (bytecode exists)...");
  const addresses = {
    membership: await membership.getAddress(),
    listing: await listing.getAddress(),
    booking: await booking.getAddress(),
    accessNft: await access.getAddress(),
  };

  const codes = await Promise.all([
    ethers.provider.getCode(addresses.membership),
    ethers.provider.getCode(addresses.listing),
    ethers.provider.getCode(addresses.booking),
    ethers.provider.getCode(addresses.accessNft),
  ]);

  const labels = [
    "MembershipManager",
    "ListingManager",
    "BookingManager",
    "AccessNFT",
  ] as const;
  codes.forEach((code, i) => {
    console.log(`${labels[i]} code length:`, code === "0x" ? 0 : code.length);
  });
  if (codes.some((c) => c === "0x")) {
    throw new Error(
      "One or more contracts have no runtime bytecode. Ensure the node is running and redeploy."
    );
  }

  // Seed mock listings
  console.log("Seeding mock listings...");
  const mockCids = [
    // Replace with your own image CIDs
    "bafybeibwzifp5z7m4o6a2d3k7t3v6ycc3v6z2r6zj5t4b2xrexample1",
    "bafybeihwzifp5z7m4o6a2d3k7t3v6ycc3v6z2r6zj5t4b2xrexample2",
    "bafybeiaazifp5z7m4o6a2d3k7t3v6ycc3v6z2r6zj5t4b2xrexample3",
  ];
  for (let i = 0; i < mockCids.length; i++) {
    const txCreate = await listing.createListing(
      // pricePerHour in wei (adjust as needed)
      ethers.parseUnits(String(0.1 * (i + 1)), 18),
      mockCids[i]
    );
    await txCreate.wait();
  }
  console.log("Mock listings seeded.");

  console.log("Setup complete.");

  // Persist deployed addresses for local usage
  const deployedPath = join(process.cwd(), "deployed.local.json");
  writeFileSync(deployedPath, JSON.stringify(addresses, null, 2));
  console.log("Wrote:", deployedPath);

  // Generate frontend .env with local RPC
  const frontendEnv = [
    `VITE_RPC=${process.env.VITE_RPC || "http://127.0.0.1:8545"}`,
    `VITE_MEMBERSHIP_ADDRESS=${addresses.membership}`,
    `VITE_LISTING_ADDRESS=${addresses.listing}`,
    `VITE_BOOKING_ADDRESS=${addresses.booking}`,
    `VITE_ACCESS_NFT_ADDRESS=${addresses.accessNft}`,
    `VITE_ACCEPTED_TOKEN=`,
  ].join("\n");
  const feEnvPath = join(process.cwd(), "frontend", ".env");
  writeFileSync(feEnvPath, frontendEnv + "\n");
  console.log("Wrote:", feEnvPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
