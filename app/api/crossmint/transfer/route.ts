import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"

const execAsync = promisify(exec)

export async function POST(request: Request) {
  try {
    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Modify the Python script to accept amount parameter
    const scriptPath = path.join(process.cwd(), "scripts", "execute-transfer.py")
    const { stdout, stderr } = await execAsync(`python ${scriptPath} ${amount}`)

    if (stderr) {
      console.error("Python script error:", stderr)
      return NextResponse.json({ error: "Failed to execute transfer" }, { status: 500 })
    }

    const result = JSON.parse(stdout)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error executing transfer script:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
