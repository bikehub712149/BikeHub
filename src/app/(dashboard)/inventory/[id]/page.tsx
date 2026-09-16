import BikeDetailsClient from "./bike-details-client";

import { getBikeById } from "@/lib/server/bike";
import { getCustomerByBikeId } from "@/lib/server/customer";

export default async function BikeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const bike = await getBikeById(id);

  if (!bike) {
    return <div>Bike Not Found</div>;
  }

  // Current records use the registration number; retain an ID fallback for older records.
  const transaction =
    (await getCustomerByBikeId(bike.number)) ??
    (await getCustomerByBikeId(bike.id));

  return (
    <BikeDetailsClient
      bike={JSON.parse(JSON.stringify(bike))}
      transaction={JSON.parse(JSON.stringify(transaction))}
    />
  );
}