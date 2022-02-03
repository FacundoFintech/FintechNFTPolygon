import { Route, Redirect } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import { useLocation } from "react-router-dom"

export const PublicRoute = ({ component: Component, ...props }) => {
    const { user: { logged, role, moralisInterface, isAdmin, isFinanciera, isMinter } } = useAuth()
    //console.log(isAdmin)
    const location = useLocation()
    //console.log(moralisInterface)
    //const url = location.state?.from?.pathname || role == "owner" ? "/fintechlist" : role == "financiera" ? "/nft-list" : "/mintnft"
    //console.log(url)

    let url_default = "/"
    let ethAddress = moralisInterface?.attributes.ethAddress
    //console.log(ethAddress)
    const url_previous = location.state?.from?.pathname || ""

    if (isAdmin) {
        url_default = "/fintechlist"
    }

    else if (isFinanciera && !isAdmin) {
        url_default = `/nft-list/${ethAddress}`
    }

    else if (isMinter) {
        url_default = "/minterlist"
    }

    //console.log(url_default,url_previous)

    /* console.log(location)
    console.log(url_test) */
    
    if (logged) {
        return <Redirect to={url_default} />
    } else {
        return <Route {...props} component={Component} />
    }
}

export const PrivateRoute = ({ component: Component, ...props }) => {
    const { user: { logged, role, routes } } = useAuth()
    const location = useLocation()
    return (
        <Route {...props} render={props => {
            if (!logged) {
                return <Redirect to={{ pathname: "/", state: { from: props.location } }} />
            } else {

                let b = false
                const path = "/" + location.pathname.split("/")[1]
                routes.forEach(route=>{
                    if (route.path.includes(path)) {
                        b = true
                    }
                })
                if(b){
                    return <Component {...props} />
                }else{
                    return <Redirect to={{ pathname: "/", state: { from: props.location } }} />
                }

            }
        }} />
    )
}