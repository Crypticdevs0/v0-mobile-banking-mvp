import { SocketProvider } from "@/hooks/useSocket"
import "@/app/globals.css"

function MyApp({ Component, pageProps }) {
  return (
    <SocketProvider>
      <Component {...pageProps} />
    </SocketProvider>
  )
}

export default MyApp
