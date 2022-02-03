import { Button } from "react-bootstrap"
import BlockchainDesign from "../../assets/BlockchainDesign"
import FondoRedondo from "../../assets/FondoRedondo"
import {Link} from 'react-router-dom'


const Dashboard = () => {
    return (
        <div id="landing">
            <FondoRedondo className="fondo-redondo" />
            <div>
                <BlockchainDesign id="blockchain-design" />
                <div id="landing-banner">
                    <h1>Acceso a tu Cuenta</h1>
                    <Link to={`/fintechlist`}>
                    <Button id="landing-login">Acceso FINTECH</Button>
                    </Link>
                    <br/>
                    <Link to={`/minterlist`}>
                    <Button id="landing-login">Acceso MINTER</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
