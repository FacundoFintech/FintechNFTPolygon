import { createContext, useContext, useEffect, useState } from "react"
import { useMoralis } from "react-moralis"
import { toast } from "react-toastify";
import { contractAbi, CONTRACT_ADDRESS } from '../../abi';
import { context as authContext } from "./Web3Provider"
import Moralis from "moralis"
import keccak256 from 'keccak256'
import routes from "../../rutes"

export const context = createContext()
const { Provider } = context


const AuthProvider = ({ children }) => {

    const { user, auth, authenticate, web3, isWeb3Enabled , account , logout , isAuthenticating} = useMoralis()
    const { manuallyEnableWeb3 } = useContext(authContext)
    const { state } = auth
    const [role, setRole] = useState({ role: "undefined", isAdmin: false, isFinanciera: false, isMinter: false, loading: false })
    const [logged, setLogged] = useState(false)
    const [logging, setLogging] = useState(true)
    const [manualLogin, setManualLogin] = useState(false)


    const getUserRole = async () => {

        const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
        const addr = user.get("ethAddress")
        setRole({ ...role, loading: true })
        

        const financiera_role = await contract.methods.hasRole("0x" + keccak256("FINANCIERA_ROLE").toString('hex'), addr).call({ from: addr })
        const minter_role = await contract.methods.hasRole("0x" + keccak256("MINTER_ROLE").toString('hex'), addr).call({ from: addr })
        const admin_role = await contract.methods.hasRole("0x0000000000000000000000000000000000000000000000000000000000000000", addr).call({ from: addr })

        if (financiera_role || minter_role || admin_role) {

            let rutas_completas = []

            if(financiera_role){
                rutas_completas = rutas_completas.concat(routes.filter(ruta => ruta.privilege.includes("financiera")))
            }

            if(minter_role){
                rutas_completas = rutas_completas.concat(routes.filter(ruta => ruta.privilege.includes("minter")))
            }

            if(admin_role){
                rutas_completas = rutas_completas.concat(routes.filter(ruta => ruta.privilege.includes("admin")))
            }
            
            setRole({
                ...role,
                loading: false,
                isAdmin: admin_role,
                isFinanciera: financiera_role,
                isMinter: minter_role,
                role: financiera_role ? "financiera" : minter_role ? "minter" : admin_role ? "admin" : "undefined",
                routes: rutas_completas
            })
            setLogged(true)
            setLogging(false)
            setManualLogin(false)
            toast.dismiss()
            toast.success("Bienvenido!")
        } else {
            setRole({ ...role, loading: false, isAdmin: false, isFinanciera: false, isMinter: false, role: "undefined" })
            setLogged(false)
            setLogging(false)
            setManualLogin(false)
            toast.dismiss()
            toast.error("No tienes permisos para acceder a esta página")
        }
    }

    const autoAuthenticationWeb3Enable = async () => {
        if (state === "authenticated" && !isWeb3Enabled) {
            if (!manualLogin) {
                toast.info("Cuenta previamente autenticada! Conectando...")
            }
            manuallyEnableWeb3()
        }
    }

    const logInToMoralis = async () => {
        try {
            toast.info("Iniciando sesión...")
            setManualLogin(true)
            await authenticate()
        } catch (e) {
            console.log(e)
            toast.error("Hubo un error al iniciar sesión")
        }
    }



    useEffect(() => {

        autoAuthenticationWeb3Enable()

        if (state == "unauthenticated" && logged) {
            setLogged(false)
            setRole({ ...role, role: "undefined", isAdmin: false, isFinanciera: false, isMinter: false, loading: false })
        }

        if (state == "authenticated" && isWeb3Enabled) {
            getUserRole()
        }

    }, [state])



    useEffect(() => {
        if (isWeb3Enabled) {
            getUserRole()
        }
    }, [isWeb3Enabled])


    useEffect(()=>{
        if(user){
            const currentUserAddr = user.get("ethAddress")
            const selectedAccount = account
            if(currentUserAddr != selectedAccount){
                toast.info("Cambiando cuenta...")
                logout()
                authenticate()
            }
        }
    },[account])

    /* useEffect(()=>{
        if(isAuthenticating){
            toast.dismiss()
            toast.info("Autenticando...")
        }
    }) */

    const valorDelProvider = {
        logInToMoralis,
        user: {
            moralisInterface: user,
            logged,
            logging,
            ...role
        }
    }

    return (
        <Provider value={valorDelProvider}>
            {children}
        </Provider>
    )
}

export default AuthProvider
