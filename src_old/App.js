import './App.css';
import MiNavbar from './components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useMoralis } from "react-moralis";
import { Route, Switch , useHistory } from 'react-router-dom';
import Prueba from './components/Prueba';
import Login from './components/Login';
import Contract from "./components/Contract"
import NFTBalance from "./components/NFTBalance";
import Start from './components/Start';
import TableNFT from './components/TableNFT';
import FintechList from './components/FintechList';
import MinterList from './components/MinterList';
import {Redirect} from 'react-router-dom';
import { createBrowserHistory } from 'history';
import Test from './components/test';
import { useEffect } from 'react';
import Moralis from "moralis"

<style>
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700&display=swap');
</style>

export const LayoutConNavbar = ({children}) => {

  const {isWeb3Enabled,enableWeb3,isWeb3EnableLoading,authenticate,isAuthenticating,isAuthenticated} = useMoralis();
  

  console.group("Render")
  console.log("WEB3 Enabled : ",isWeb3Enabled)
  console.log("WEB3 Loading",isWeb3EnableLoading)
  console.log("Authenticated : ",isAuthenticated)
  console.log("Authenticating : ",isAuthenticating)
  
  
  /* useEffect(()=>{
    if(!isWeb3Enabled){
      enableWeb3()
    }
  },[]) */

  // return "Layout con navbar"

  /*
    sin metamask : false - false - true - false (aparece como ya autenticado)
    con metamask : false - false - false - false ()
    
  */

  if (isWeb3Enabled && !isWeb3EnableLoading) {
    console.log("True")
    return <Redirect to="/marketplace" />
  } else {
    console.log("False")
    return (
      <>
        <MiNavbar />
        {children}
      </>
    )
    //} 
  }
}

/* const RutaConNavbar = ({ component: Component, ...rest }) => {
  return (
    <Route {...rest}>
      <MiNavbar />
      <Component {...props} />
    </Route>
  )
}
 */

const App = () => {
  const { auth,web3, authenticate, isAuthenticated, isWeb3Enabled,enableWeb3, user, logout, isAuthenticating, isWeb3EnableLoading , isInitializing} = useMoralis();
  const {state,error} = auth
  const history = useHistory()


  /**
   * Siempre tiene que estar web3 habilitado. Se puede habilitar desde Moralis directamente, pero en ese caso el hook de react no funciona, lo unico que te dice si esta habilitado o no es la instancia de web3. Se puede habilitar desde el hook y ahi podes ver lo loading y la instancia de web3 desde el mismo hook. Esta la duda de si la funcion enableWeb3 habre metamask o no (En teoria lo testie y no)
   * 
   * Siempre el usuario tiene que estar autenticado. Se puede autenticar con la funcion authenticate y tener acceso al loading y a la info del usuario de moralis (?). Si no se autentica previamente el metodo  Moralis.User.current() da undefined. Si se autentica previamente , la info del usuario ya se encuentra en user usando el mismo hook. Se autentica automaticamente al iniciar la app y se puede ver con state y error. Si encuentra un localStorage con la info del usuario previamente seteada, te marca como autenticado pero mientras el estado es undefined. Tambien se puede ver usando el isAuthenticated y isAuthenticating , y la primera si nos dice si esta autenticado o no pero la segunda no dice que lo esta haciendo manual, solo lo podemos ver con el undefined del state previo.  
   */
  
  console.log(isAuthenticated)
  console.log(isAuthenticating)
  //console.log(auth)
  //console.log(isInitializing)
  console.log(state)
  /* console.log(isWeb3Enabled)
  console.log(isWeb3EnableLoading)
  console.log(web3) */

  const getUser = async () => {
    //const web3 = await Moralis.enableWeb3();
    //const auth = await authenticate()
    //let currentUser =  Moralis.User.current();
    //console.log(currentUser)
  }

  useEffect(()=>{
    //getUser()
    //enableWeb3()
    //console.log(enableWeb3())
    /* console.log(web3)
    Moralis.enableWeb3()
    .then((web3)=>{
      console.log(web3)
    }) */
  },[])

  if (isWeb3Enabled && !isWeb3EnableLoading) {
    //history.push("/marketplace")
    /* console.log("True")
    return <Router ><Redirect to="/marketplace" /><Switch> <Route exact path="/marketplace" component={Prueba} /></Switch>{window.location.reload()}</Router>  */
  }

  return (
    <>
      
         {/* <MiNavbar/>  */}
        {/* para logout */}
        {/* <div id="body" style={{backgroundColor: "#f0f2f5;"}}> */}
          {/* <button onClick={() => logout()} disabled={isAuthenticating}></button> */}
          <Switch>
            <Route exact path="/start" component={Start}/>
            <Route exact path="/marketplace" component={Prueba} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/contract" component={Contract} />
            <Route exact path="/nftbalance" component={NFTBalance} />
            <Route exact path="/tablenft" component={TableNFT} />
            <Route exact path="/fintechlist" component={FintechList} />
            <Route exact path="/minterlist" component={MinterList} />
            <Route exact path="/test" component={Test} />
          </Switch>
        {/* </div> */}
    </>
  );
}

export default App;