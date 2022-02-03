import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import useAuth from "../hooks/useAuth"
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { useEffect } from 'react'
import { useMoralis } from "react-moralis";
import { contractAbi, CONTRACT_ADDRESS } from "../../abi"
import Moralis from 'moralis';
import { Link } from 'react-router-dom'
import { Button } from "@mui/material"
import { Redirect } from "react-router-dom"
import { Container } from "react-bootstrap"
import Modal from 'react-bootstrap/Modal'
import Stack from '@mui/material/Stack';
import Input from '@mui/material/Input';
import { useParams } from "react-router-dom"
import { useNFTBalances, useMoralisQuery } from "react-moralis";
import { createTheme, ThemeProvider } from '@mui/material/styles';

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

const GridNFT = () => {

    const { user: { moralisInterface: user } } = useAuth()
    const { web3 } = useMoralis()
    const [misNfts, setMisNfts] = React.useState([])
    const [loaded, setLoaded] = React.useState(false)
    const [tokenId, setTokenId] = React.useState(0)
    const [address, setAddress] = React.useState("true")
    const [disabled, setDisabled] = React.useState(true)
    const [name, setName] = React.useState("")
    const { id } = useParams()
    const [showModal, setShowModal] = React.useState(false);
    const { getNFTBalances, data: nfts, error, isFetching } = useNFTBalances();
    const [selectedId, setSelectedId] = React.useState("")


    // const [redirect, setRedirect] = React.useState(false)
    event()

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

    const formatDate = (valor) => {
        if (valor) {
            console.log(valor)
            const fecha = new Date(valor)
            const dia = fecha.getDate()
            const mes = fecha.getMonth() + 1
            const year = fecha.getFullYear()
            const fecha_formateada = `${dia}/${mes}/${year}`
            return fecha_formateada
        }
    }



    const handleNameChange = e => {
        setName(e.target.value)
    }

    const handleCloseModal = () => {
        setShowModal(false)
    }

    const transferirNft = async () => {
        //setLoading(true)
        const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
        contract.methods.transferNft(address, selectedId, name).send({ from: user.attributes.ethAddress })
            .on('error', function (error, receipt) {
                console.log('error: ', error)
                window.location.reload()
            })
    }

    const getNftMetadata = async () => {
        const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
        const address = await contract.methods.ownerOf(id).call()
        getNFTBalances({ address })
    }



    const nft = async () => {
        try {
            const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
            const fintech = await contract.methods.getFintech(user.attributes.ethAddress).call()
            const tokens = fintech?.nfts
            console.log(tokens)
            const nft = Moralis.Object.extend("PolygonNFTOwners")
            const query = new Moralis.Query(nft)
            query.exists("token_id")
            query.equalTo("token_address", CONTRACT_ADDRESS.toLowerCase())
            query.containedIn("token_id", tokens)
            const nfts = await query.find()
            console.log(nfts)
            setMisNfts(nfts)
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        nft()
    }, [])


    const getNftsImg = async () => {

        const test = await Promise.all(misNfts.map(async nft => {
            const token_uri = nft.attributes.token_uri.split('/')[4]
            if (token_uri.length > 4) {
                const response = await fetch(nft.attributes.token_uri);
                const metadata = await response.json();
                const attributes = {}

                Object.keys(nft.attributes).map(key => {
                    attributes[key] = nft.attributes[key]
                })

                return { ...nft, attributes, metadata }
            } else {
                return { ...nft }
            }
        }))

        setMisNfts(test)
    }


    useEffect(() => {

        console.log(loaded)
        if (misNfts.length && !loaded) {

            getNftsImg()
            setLoaded(true)

        }

    }, [misNfts])
    /* 
        console.log(misNfts[0].attributes?.owner_of)
        setOwner(misNfts[0].attributes?.owner_of) */


    const Item = styled(Paper)(({ theme }) => ({
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }));

    // if (redirect) {
    //     function render() {    
    //         return <Redirect to={`/nft-detail/${tokenId}`}/>;
    //     }
    // }

    const theme = createTheme({
        breakpoints: {
          values: {
            xs: 576,
            sm: 767,
            md: 991,
            lg: 1200,
            xl: 1400
          },
        },
    });

    return (
        <>
            <ThemeProvider theme={theme}>
                <Container >
                    <Box sx={{ flexGrow: 1 }} mt={7} >
                        <Grid container spacing={2} spacing={6} justifyContent="center">
                            {misNfts?.map((nft) => {

                                const imgUrl = nft.metadata?.image
                                console.log(nft.metadata?.image)
                                console.log(imgUrl)
                                console.log(nft.attributes)
                                console.log(nft.metadata)

                                return (
                                    <Grid item xl={3} lg={3} md={3} sm={6} xs={12}>
                                        <Card justifyContent="center" id="mi-card">
                                            <CardActionArea >
                                                <CardMedia
                                                    component="img"
                                                    height="140"
                                                    image={nft.metadata?.image}
                                                    // image={nft.metadata?.image}
                                                    alt={`token ${nft.attributes?.name}`}
                                                    sx={{ height: "330px", width: "230px", margin: "auto" }}
                                                    id="card-media" />

                                                <div className="descr-botones">

                                                    <CardContent id="card-texto">
                                                    <Typography id="nft-info-card" variant="body2" color="text.secondary">
                                                            {nft.metadata?.name}
                                                        </Typography>
                                                        <Typography id="nft-id-card" gutterBottom variant="h5" component="div">
                                                            Description: {nft.metadata?.description}
                                                        </Typography>
                                                        <Typography id="nft-id-card" gutterBottom variant="h5" component="div">
                                                            Loan Id: {nft.metadata?.attributes[0].value}
                                                        </Typography>
                                                        <Typography id="nft-id-card" gutterBottom variant="h5" component="div">
                                                            Created at: {formatDate(nft.metadata?.attributes[1].value)}
                                                        </Typography>
                                                        <Typography id="nft-id-card" gutterBottom variant="h5" component="div">
                                                            Token Id: {nft.attributes?.token_id}
                                                        </Typography>
                                                    </CardContent>
                                                    <CardContent className="card-botones" sx={{ padding: "0 16px 16px" }}>
                                                        <Link to={`/nft-detail/${nft.attributes?.token_id}`}>
                                                            <Button variant="contained" className="botones-card" sx={{ borderRadius: "10px", backgroundColor: "#653DBD;", fontFamily: "'Roboto Condensed', sans-serif;", fontWeight: "700", fontSize: "1rem", padding: "0" }} >VER</Button>
                                                        </Link>
                                                        <Button onClick={() => { setShowModal(true); setSelectedId(nft.attributes?.token_id) }} variant="contained" className="botones-card" sx={{ borderRadius: "10px", backgroundColor: "#653DBD;", fontFamily: "'Roboto Condensed', sans-serif;", fontWeight: "700", fontSize: "1rem", padding: "0 20px", opacity: "60%" }}>TRANSFERIR</Button>
                                                    </CardContent>
                                                </div>
                                            </CardActionArea>
                                        </Card>
                                    </Grid>
                                )
                            })}
                        </Grid>
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
                                    <Input value={selectedId} fullWidth={true} id='transfer-input' onChange={handleAddressChange} disabled />
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
                    </Box>
                </Container>
            </ThemeProvider>
        </>
    )
}

export default GridNFT