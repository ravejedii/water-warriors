import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"

const execAsync = promisify(exec)

export async function GET() {
  try {
    const scriptPath = path.join(process.cwd(), "scripts", "get-farmer-balance.py")
    const { stdout, stderr } = await execAsync(`python ${scriptPath}`)

    if (stderr) {
      console.error("Python script error:", stderr)
      return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 })
    }

    const result = JSON.parse(stdout)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error executing balance script:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
