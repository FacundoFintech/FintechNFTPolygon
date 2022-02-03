import Page from "../Page"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useNFTBalances, useMoralisQuery } from "react-moralis";
import { contractAbi, CONTRACT_ADDRESS } from "../../abi"
import { useMoralis } from "react-moralis"
import useAuth from "../hooks/useAuth"
import boredApe from "../../deleteMedia/unnamed.png"
import Grid from '@mui/material/Grid';
import Moralis from "moralis"
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import '../../Tables.css';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea, CardActions } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EmailIcon from '@mui/icons-material/Email';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import Modal from 'react-bootstrap/Modal'
import Stack from '@mui/material/Stack';
import 'font-awesome/css/font-awesome.min.css';
import { Container } from "react-bootstrap"
import {useHistory} from 'react-router-dom'

//const {push} = useHistory()
//push("url")

async function event() {
    const web3 = await Moralis.enableWeb3();
    const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
    contract.events.eventFintech(function (error, event) { console.log(event); })
        .on('data', function (event) {
            console.log(event); // same results as the optional callback above
            window.location.reload()
            //TIRAR PANTALLA PARA ATRAS
        })
        .on('changed', function (event) {
            console.log("changed")
            // remove event from local database
        })
        .on('error', function (event) {
            window.location.reload()
        });
}

const NFTDetails = () => {

    const { user: { moralisInterface: user, role: isAdmin, isFinanciera } } = useAuth()
    const { id } = useParams()
    const { web3 } = useMoralis()
    const { getNFTBalances, data: nfts, error, isFetching } = useNFTBalances();
    const [nft, setNft] = useState({})
    const [address, setAddress] = useState("true")
    const [disabled, setDisabled] = useState(true)
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const {push} = useHistory()
    const [_isOwner, setOwner] = useState(true)
    

    event()

    const isOwner = async () => {
        const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
        //const owner = await Promise(await contract.methods.ownerOf(id).call())
        await contract.methods.ownerOf(id).call(function (error, result) {
            console.log(result)
            setOwner(true)
        })
        // console.log(owner)
        // console.log(user.attributes.ethAddress)
        // console.log(owner.toLowerCase())
        // if (owner.toLowerCase() === user.attributes.ethAddress){
        //     console.log('es igual')
        //     setOwner(true)
        // }
    }

    //const {push} = useHistory()
    //push("url")

    console.log(user.tokens)

    const handleAddressChange = async e => {
        const regex = /^(0x)?[0-9a-f]{40}$/i;
        if (regex.test(e.target.value)) {
            const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
            const addresses = await contract.methods.getArrayAddressFintech().call()

            setAddress(e.target.value)
            console.log(addresses)
            console.log(address)

            if (addresses.includes(e.target.value)) {
                const fintech = await contract.methods.getFintech(e.target.value).call()
                console.log("existe")
                const name = fintech.fintechName
                console.log(name)
                setName(name)
            } else {
                console.log("no existe")
                setDisabled(false)
            }
        } else {
            setName("")
            setDisabled(true)
        }
        // }
        // else {
        //     console.log(address)
        //     console.log("nop")
        //     setName("")

        // }
    }


    const handleNameChange = e => {
        setName(e.target.value)
    }

    const getNftMetadata = async () => {
        const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
        const address = await contract.methods.ownerOf(id).call()
        getNFTBalances({ address })
    }

    const transferirNft = async () => {
        //setLoading(true)
        const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
        contract.methods.transferNft(address, id, name).send({ from: user.attributes.ethAddress })
            .on('error', function (error, receipt) {
                window.location.reload()
            })
    }

    const handleCloseModal = () => {
        setShowModal(false)
    }

    useEffect(() => {
        isOwner()
        getNftMetadata()
    }, [])

    useEffect(() => {
        if (nfts) {
            const nft = nfts.result.find(nft => nft.token_id == id)
            setNft(nft)
        }
    }, [nfts])


    const { data: data, error: err, isLoading } = useMoralisQuery("Metadata", query =>
        query
            .equalTo("TokenId", parseInt(id))
        //.equalTo("TokenId", [0,2,5])
    );

    const formatDate = (valor) => {
        if(valor){
            console.log(valor)
            const fecha = new Date(valor)
            console.log(fecha)
            const dia = fecha.getDate()
            const mes = fecha.getMonth() + 1
            const year = fecha.getFullYear()
            const fecha_formateada = `${dia}/${mes}/${year}`
            return fecha_formateada
        }
    }


    console.log(user)

    console.log(id)
    console.log(err)
    if (data.length) {
        console.log(isLoading)
        console.log(data[0].attributes)
        console.dir()
        const fecha = new Date(data[0]?.attributes.FechaCreacion)
        const dia = fecha.getDate()
        const mes = fecha.getMonth() + 1
        const year = fecha.getFullYear()
        const fecha_formateada = `${dia}/${mes}/${year}`
        console.log(fecha_formateada)
    }

        return user.tokens?.includes(Number(id)) ? (
            <Container>
                {!loading ? (
                    <div className="container-site" style={{ paddingTop: "4rem" }}>
    
    
                        <Grid container spacing={3}>
                            <Grid xs={12} md={4}>
                                <div className="page-subsection">
                                    <h2>NFT ID: {data[0]?.attributes.TokenId} </h2><br />
    
                                    <Card sx={{ maxWidth: 345 }} className='card-details'>
                                        <CardActionArea>
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={data[0]?.attributes.UriImage}
                                                alt=""
                                            />
    
                                        </CardActionArea>
                                        <CardActions className="card-buttons">
                                            
                                            <a href={data[0]?.attributes.UriContract} target="_blank" className="stack">
                                                <Button className='btn-link-pdf' ><i class="far fa-file-pdf" id="file-pdf"></i>&nbsp;   Download PDF</Button>
                                            </a>
                                            <Button onClick={() => setShowModal(true)} className='btn-link-transfer'><i class="fas fa-exchange-alt"></i>&nbsp;Transfer</Button>
                                        </CardActions>
                                    </Card>
                                </div>
                            </Grid>
    
    
    
                            <Grid xs={12} md={4}>
                                <div className="contractInfo">
                                    <h4 className="title-details">Detalles del Contrato</h4>
                                    <div id="detalles-contrato">
                                        <div className="columna-detalles">
                                            <p className="info-details"><PermIdentityIcon /><b> Titular:</b> <span className="info-details-data">{data[0]?.attributes.FullName}</span></p>
                                            <br />
                                            <p className="info-details"> <EventNoteIcon /> <b>Fecha:</b> <span className="info-details-data">{formatDate(data[0]?.attributes.FechaCreacion)}</span></p>
                                            <br />
                                            <p className="info-details"><BadgeIcon /> <b>CUIL:</b> <span className="info-details-data">{data[0]?.attributes.CUIL}</span></p>
                                            <br />
                                            <p className="info-details"><LocationOnIcon /><b> Direccion:</b> <span className="info-details-data">{data[0]?.attributes.Direccion}</span></p>
                                            <br />
                                            <p className="info-details"><EmailIcon /><b> Mail:</b> <span className="info-details-data">{data[0]?.attributes.Email}</span></p>
                                            <br />
                                            <p className="info-details"><PhoneAndroidIcon /><b> Celular:</b> <span className="info-details-data">{data[0]?.attributes.Celular}</span></p>
                                            <br />
                                        </div>
                                    </div>
                                </div>
                            </Grid>
                            <Grid xs={12} md={4}>
                                <div className="wrap-columna-montos">
                                    <div className="columna-montos">
                                        <p className="info-details"><AccountBalanceIcon className="bank-icon" /><CreditCardIcon className="bank-icon" /></p>
                                        <p className="info-details"><b className="monto">Monto del préstamo:</b><br /><span className="info-details-data monto-money"> ${data[0]?.attributes.MontoPrestamo}</span></p>
                                        <p className="info-details"><b>Cantidad de cuotas:</b> <span className="info-details-data">{data[0]?.attributes.CantidadCuotas}</span></p>
                                        <p className="info-details"><b>Valor cuota:</b> <span className="info-details-data">${(data[0]?.attributes.MontoPrestamo / data[0]?.attributes.CantidadCuotas).toFixed(2)}</span></p>
                                        <p className="info-details"><b>Vencimiento cuota 1:</b> <span className="info-details-data">{formatDate(data[0]?.attributes.FechaPrimerVencimiento)}</span></p>
                                    </div>
                                </div>
                            </Grid>
                        </Grid>
                    </div >
                ) : (<Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open
                >
                    <CircularProgress color="inherit" />
                    <h3> &nbsp; &nbsp; Procesando transaccion, por favor espere.</h3>
                </Backdrop>)}
                <Modal show={showModal} onHide={handleCloseModal} className="modal-all">
                    <Modal.Header closeButton className="modal-header">
                        <Modal.Title className="modal-title"> <i class="fas fa-exchange-alt"></i>&nbsp;Transfer NFT</Modal.Title>
                    </Modal.Header>
    
                    <Modal.Body className="modal-body">
                        <p className="modal-p">
                            Transfer NFT to another Fintech with this form.
                        </p>
                        <br /><br />
                        <Stack spacing={6}>
                            <Input placeholder=' Address' className='form-input' onChange={handleAddressChange} name="address" pattern="(/^0x[a-fA-F0-9]{40}$/)" />
                            <Input value={id} fullWidth={true} id='transfer-input' onChange={handleAddressChange} disabled />
                            <Input value={name} placeholder=" Name" fullWidth={true} name="name" id='transfer-input' onChange={handleNameChange} />
                        </Stack>
                    </Modal.Body>
                    <Modal.Footer className='modal-footer'>
                        <Stack spacing={4} >
                            <Button placeholder="Transferir" onClick={transferirNft} className="btn-modal">Transfer</Button>
                            <Button variant="secondary" onClick={handleCloseModal} className='btn-modal-close'>Close</Button>
                        </Stack>
                    </Modal.Footer>
                </Modal>
            </Container>
        ) : <div>{push("/nft-list/" + user.attributes.ethAddress, { update: true })}</div> 
}

export default NFTDetails