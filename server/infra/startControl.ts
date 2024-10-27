import { msgBox } from "../utils/msgBox";

export async function startControl(serverPort: number) {

  const sistemBaseUrl = `http://localhost:${serverPort}`

  try {
    const response = await (await fetch(`${sistemBaseUrl}/live`)).text()
    if (response == 'b71fbfbd-e735-4101-a5a3-3bd6b869d1f4') {
      msgBox("Sistema online!", "Atenção", "okOnly")
      const proc = Bun.spawn(['cmd', '/c', 'start', sistemBaseUrl])
      await new Response(proc.stdout).text();
      process.exit()
    }
  } catch { }

  if (msgBox("Realmente deseja iniciar o sistema?", "Atenção", "yesOrNo") == 'no') {
    process.exit()
  }

  Bun.spawn(['cmd', '/c', 'start', sistemBaseUrl])

}
