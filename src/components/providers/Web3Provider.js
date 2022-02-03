import { createContext, useEffect } from "react"
import { useMoralis } from "react-moralis"

export const context = createContext()
const { Provider } = context

const Web3Provider = ({ children }) => {

    const {enableWeb3} = useMoralis()

    const manuallyEnableWeb3 = () => {
        enableWeb3()
    }

    const valorDelProvider = {
        manuallyEnableWeb3
    }

    return (
        <Provider value={valorDelProvider}>
            {children}
        </Provider>
    )
}

export default Web3Provider
