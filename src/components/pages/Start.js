import { Button } from 'react-bootstrap';
import BlockchainDesign from "../../assets/BlockchainDesign"
import FondoRedondo from "../../assets/FondoRedondo"
import useAuth from "../hooks/useAuth"
import { useMoralis, useMoralisQuery } from "react-moralis"
import '../../Tables.css';
import { Container } from "react-bootstrap"


const Start = () => {

    const { logInToMoralis } = useAuth()

    return (
        <>
            <Container id="start-container-nuevo">
                <div>
                    <h1 id="acceso-nft">
                        Access to Contract
                        <br />
                        NFTs
                    </h1>
                    <Button color='primary' onClick={logInToMoralis} id="connect-wallet-login">CLIENT LOGIN</Button>
                </div>
                <div>
                    <BlockchainDesign id="blockchain-design" width={600} height={600} />
                </div>
            </Container>
            <div id="start-fondo">
                <FondoRedondo className="fondo-redondo" />
            </div>
        </>
    )
}


export default Start




{/* <>
            <div className='container-site'>
                <div className="container-start">
                    <div id="circulo-container">
                        <div className="circulo-container">
                            <BlockchainDesign id="blockchain-design" width={600} height={600} />
                            <FondoRedondo className="fondo-redondo" />
                        </div>
                    </div>
                </div>

                <div id="start-container">
                    <div id="texto-start">
                        <h1 id="acceso-nft">
                            Access to Contract
                            <br />
                            NFTs
                        </h1>
                        <Button color='primary' onClick={logInToMoralis} id="connect-wallet-login">CLIENT LOGIN</Button>
                    </div>
                </div>
            </div>
        </> */}