import { auth } from "@/auth"
import { SimulateurScenarios } from "@/components/SimulateurScenarios"

export default async function Home() {
  const session = await auth()
  return (
    <SimulateurScenarios
      userName={session?.user?.name ?? null}
      userImage={session?.user?.image ?? null}
    />
  )
}
