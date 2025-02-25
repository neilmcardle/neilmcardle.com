import { NextResponse } from "next/server"

export async function GET() {
  const figmaFileId = "zZcc3Li72GhWFVpv1PxC0O"
  const nodeId = "0:1" // Assuming the navigation is on the first page

  const apiUrl = `https://api.figma.com/v1/files/${figmaFileId}/nodes?ids=${nodeId}`

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "X-Figma-Token": process.env.FIGMA_ACCESS_TOKEN as string,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch Figma data")
    }

    const data = await response.json()
    const navComponent = data.nodes[nodeId].document.children.find((child: any) => child.name === "top-navigation")

    if (!navComponent) {
      throw new Error("Navigation component not found")
    }

    // Extract navigation items
    const menuItems = navComponent.children
      .filter((child: any) => child.type === "TEXT")
      .map((child: any) => ({
        name: child.characters,
        link: `/${child.characters.toLowerCase().replace(" ", "-")}`,
      }))

    // Extract logo (assuming it's the first vector in the component)
    const logo = navComponent.children.find((child: any) => child.type === "VECTOR")?.name || "NM"

    return NextResponse.json({
      logo,
      menuItems,
    })
  } catch (error) {
    console.error("Error fetching Figma data:", error)
    return NextResponse.json({ error: "Failed to fetch navigation data" }, { status: 500 })
  }
}

