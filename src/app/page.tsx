import { FacilityDirectory } from "./facility-directory";
import { loadPublicFacilities } from "@/lib/load-facilities";

export const dynamic = "force-dynamic";

export default async function Home() {
  const directory = await loadPublicFacilities();
  return (
    <FacilityDirectory
      initialFacilities={directory.facilities}
      mode={directory.mode}
    />
  );
}
