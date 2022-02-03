import { ToastContainer } from 'react-toastify';
import Header from "./Header"
import Main from "./Main"
import Footer from "./Footer"

const Layout = () => {

    return (
        <>
            <Header/>
            <Main/>
            <ToastContainer position='bottom-right' autoClose={1500} />
            <Footer/>
        </>
    )
}

export default Layout
