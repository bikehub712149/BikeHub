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

  const transaction = await getCustomerByBikeId(bike.number);

  return (
    <BikeDetailsClient
      bike={JSON.parse(JSON.stringify(bike))}
      transaction={JSON.parse(JSON.stringify(transaction))}
    />
  );
}