import Moralis from 'moralis';
import { useState, useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Page from "../Page";
import { contractAbi, CONTRACT_ADDRESS } from "../../abi"
import useAuth from "../hooks/useAuth"
import { create } from 'ipfs-http-client'
import keccak256 from 'keccak256'
import '../../Tables.css';
import Grid from '@mui/material/Grid';
import 'font-awesome/css/font-awesome.min.css';
import { useMoralis } from "react-moralis";
import { Container } from "react-bootstrap";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Icon } from '@mui/material';




// const { Option } = Select;
// const client = create('https://ipfs.infura.io:5001/api/v0')

// const onFinishFailed = (errorInfo) => {
//     console.log('Failed:', errorInfo);
// };

async function event() {
    const web3 = await Moralis.enableWeb3();
    const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
    contract.events.eventFintech(function (error, event) { console.log(event); })
        .on('data', function (event) {
            console.log(event); // same results as the optional callback above
            window.location.reload()
        })
        .on('changed', function (event) {
            console.log("changed")
            // remove event from local database
        }) 
        .on('error', function (event) {
            window.location.reload()
        });
}



const MintNFT = () => {

    const { web3 } = useMoralis()
    const [fileUrl, updateFileUrl] = useState('')
    const [pdfUrl, updatePdfUrl] = useState('')
    const { user: { moralisInterface: user, isAdmin, isFinanciera, isMinter } } = useAuth()
    const [form] = Form.useForm();
    const { Option } = Select;
    const [fileHash, setFileHash] = useState('');
    const [financieras, setFinancieras] = useState([])
    const [loading, setLoading] = useState(false);
    const [loadingImg, setLoadingImg] = useState(false);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [name, setName] = useState("Nombre Financiera")
    const [Id, setId] = useState("Id Financiera")
    const [currentName, setCurrentName] = useState("")
    const [state, setState] = useState({
        nameNFT: "",
        description: "",
        nroPrestamo: "",
        nroCliente: "",
        titular: '',
        fecha: '',
        cuil: '',
        direccion: '',
        email: '',
        celular: '',
        FintechId: '',
        fintechName: '',
        address: '',
        monto: '',
        nroCuotas: "",
        valorCuota: '',
        imagen: '',
        pdf: '',
        fechaPrimerVencimiento: '',
    })

    let jasonHashMetadataBase = {
        "LoanId": parseInt(state.nroPrestamo),
        "FintechId": parseInt(state.FintechId),
        "FintechName": (state.fintechName).toString(),
        "MontoPrestamo": parseInt(state.monto),
        "CantidadCuotas": parseInt(state.nroCuotas.value),
        "FechaPrimerVencimiento": (state.fechaPrimerVencimiento).toString(),
        "FechaCreacion": (state.fecha).toString(),
        "NroCliente": parseInt(state.nroCliente),
        "CUIL": state.CUIL,
        "Email": state.email,
        "FullName": state.titular,
        "Celular": state.celular,
        "Direccion": state.direccion,
        "UriImage": fileUrl,
        "UriContract": pdfUrl
    }

    event()
    const jsnString = JSON.stringify(jasonHashMetadataBase);

    console.log(user)

    //console.log(jsnString);

    const HashRegistroBase = keccak256(jsnString).toString('hex');

    //console.log('0x' + HashRegistroBase);

    //console.log(keccak256(Buffer.from(jsnString)).toString('hex')) 

    let jason =
    {
        "name": state.nameNFT,
        "description": state.description,
        "image": fileUrl,
        "attributes": [
            {
                "trait_type": "LoanId",
                "value": parseInt(state.nroPrestamo)
            },
            {
                "trait_type": "FechaCreacion",
                "value": (state.fecha).toString()
            },
            {
                "trait_type": "NroCliente",
                "value": parseInt(state.nroCliente)
            },
            {
                "trait_type": "FintechId",
                "value": Id
            },
            {
                "trait_type": "HashRegistroBase",
                "value": HashRegistroBase
            }
        ]

    }



    async function getFinancieras() {
        const web3 = await Moralis.enableWeb3();
        let i = 0
        const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
        const currentFintech = await contract.methods.getFintech(user.attributes?.ethAddress).call()
        const addresses = await contract.methods.getArrayAddressFintech().call()
        const ids = await Promise.all(addresses.map(async address => {
            return await contract.methods.getFintech(address).call()
        }))
        console.log(ids)
        var c = addresses.map(function (e, i) {
            return [e[i].fintechId, addresses[i]];
        });
        setCurrentName(currentFintech.fintechName)
        setFinancieras(c.map(a => ({
            id: a[0],
            address: a[1],
            index: i++
        })));
        //console.log(addresses)
        //console.log(financieras)
    }

    useEffect(() => {
        getFinancieras()
        lockAddesses()
    }, [])




    async function lockAddesses() {
        const currentUser = Moralis.User.current();

        const user = currentUser.attributes.accounts[0]
        console.log(currentUser.attributes.accounts[0])
        {
            financieras.map((adr) => {
                console.log(adr)
                if (user.toLowerCase() == adr.address.toLowerCase()) {
                    console.log('El address es: ' + user)

                } else {
                    console.log('address: ' + adr.address + ' user: ' + user)
                }
            })
        }

    }

    const onFinish = async (values) => {
        setLoading(true)
        console.log('file url : ' + fileUrl)
        //SUBIDA DEL JSON
        const jsn = JSON.stringify(jason);

        const blob = new Blob([jsn], { type: 'application/json' });
        const file = new File([blob], 'file.json');
        let hash
        try {
            const filee = new Moralis.File("jasonData", file)
            await filee.saveIPFS();
            console.log(filee.ipfs(), filee.hash());
            hash = filee.ipfs()
            setFileHash(hash)
            console.log('hash ' + hash)
        }
        catch (error) {
            console.log('error: ', error)
        }


        const web3 = await Moralis.enableWeb3();
        const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
        

        //console.log('el hash llega como ' + hash)

        //console.log(state)

        console.log(state.address, hash.toString(), [parseInt(state.nroPrestamo), parseInt(state.nroCliente), parseInt(state.FintechId), (state.fecha).toString(), fileUrl, ('0x' + HashRegistroBase).toString()])

        const receipt = await contract.methods.mintNFT(state.address, hash.toString(), [parseInt(state.nroPrestamo), parseInt(state.nroCliente), parseInt(state.FintechId), (state.fecha).toString(), fileUrl, ('0x' + HashRegistroBase).toString()]).send({ from: user.attributes.ethAddress })
        
        console.log(receipt)

        if(receipt){

            console.log("Dentro del receipt")

            const Metadata = Moralis.Object.extend("Metadata");
            const metadata = new Metadata();
    
            metadata.set("LoanId", parseInt(values.nroPrestamo));
            metadata.set("FintechId", parseInt(Id));
            metadata.set("MontoPrestamo", parseInt(values.monto));
            metadata.set("CantidadCuotas", parseInt(values.nroCuotas.value));
            metadata.set("Direccion", values.direccion);
            metadata.set("Celular", values.celular);
            metadata.set("CUIL", values.CUIL);
            metadata.set("FechaPrimerVencimiento", (values.fechaPrimerVencimiento).toString());
            metadata.set("FullName", values.titular);
            metadata.set("Email", values.email);
            metadata.set("NroCliente", parseInt(values.nroCliente));
            metadata.set("TokenId", parseInt(receipt.events?.eventFintech.returnValues[1]));
            metadata.set("MetadataHash", HashRegistroBase);
            metadata.set("UriImage", fileUrl);
            metadata.set("FechaCreacion", (values.fecha).toString());
            metadata.set("UriContract", pdfUrl);
            metadata.set("FintechName", name);
            
            metadata.save()
            .then((registro) => {
                console.log(registro)
                event()
            }, error => {
                alert('Failed to create new object, with error code: ' + error.message)
                window.location.reload()
            })

        }else{
            alert("Failed to mint new nft")
            window.location.reload()
        }
    };

    /*  useEffect(()=>{
 
         if(fileHash){
 
         }
 
     },[fileHash])
  */


    async function onChange(e) {
        setLoadingImg(true)
        const file = e.target.files[0]
        try {

            console.log(loadingImg)
            console.log(file)
            const filee = new Moralis.File(file.name, file)
            await filee.saveIPFS();
            console.log(filee.ipfs(), filee.hash())
            const url = filee.ipfs()
            updateFileUrl(url)
            console.log('hola ' + fileUrl)
            setLoadingImg(false)


        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }

    async function onChangePdf(e) {

        const file = e.target.files[0]
        try {
            await setLoadingPdf(true)

            const filee = new Moralis.File(file.name, file)
            await filee.saveIPFS();
            console.log(filee.ipfs(), filee.hash())
            const url = filee.ipfs()
            updatePdfUrl(url)
            console.log('hola ' + pdfUrl)
            setLoadingPdf(false)


        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }



    function handleChange(evt) {
        const value = evt.target.value;
        setState({
            ...state,
            [evt.target.name]: value
        });
    }

    const handleDatePicker = (date, dateString) => {
        setState({
            ...state,
            "fecha": date,
        })
    }

    const handleDatePickerExp = (date, dateString) => {
        setState({
            ...state,
            "fechaPrimerVencimiento": date
        })
    }

    function handleCuotas(value) {

        setState({
            ...state,
            nroCuotas: value.value
        })
        //console.log(value.value);
    }

    async function handleAddress(value) {

        const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
        const addresses = await contract.methods.getArrayAddressFintech().call()
        console.log("test")
        if (value){
            const fintech = await contract.methods.getFintech(value.value).call()
            const name = fintech.fintechName
            const Id = fintech.fintechId

            setName(name)
            setId(Id)
            setState({
                ...state,
                fintechName: name,
                FintechId: Id,
                address: value.value
            })
        }
        else {
            setName('Nombre Financiera')
            setId('Id Financiera')
        }


        console.log(addresses)
  
    }




    return (


        <Container>
            {!loading ? (
                <div className="container-site form-mgmt">
                    <Page title={currentName} id="minter-list-page">
                        <div className="page-subsection">
                            <h2>Mint new NFT</h2>

                            <Form className='mint_token_form'
                                form={form}
                                name="basic"
                                labelCol={{
                                    span: 8,
                                }}
                                wrapperCol={{
                                    span: 20,
                                }}
                                initialValues={{
                                    remember: true,
                                }}
                                onFinish={onFinish}
                                //onFinishFailed={onFinishFailed}
                                autoComplete="off"
                            >

                                <Grid container spacing={0}>
                                    <Grid item xs={6}>

                                        <Form.Item

                                            name="address"
                                            rules={[{
                                                required: true,
                                                //pattern: new RegExp(/^0x[a-fA-F0-9]{40}$/),
                                                //message: 'Ingrese un address valido',
                                            },]} >
                                            <Select
                                                labelInValue
                                                placeholder="  Select address"
                                                name='address'
                                                allowClear
                                                onChange={handleAddress}
                                                className='form-input fake-select'
                                                suffixIcon={<Icon className='prefix-down'>&#xf0e0;</Icon>}
                                            >

                                                {isAdmin || isMinter ? financieras.map((adr) => (
                                                    <Option key={adr.address}>{adr.address} </Option>
                                                )) : financieras.filter((adr) => adr.address.toLowerCase() == user.attributes.ethAddress.toLowerCase()).map((adr) => (
                                                    <Option key={adr.address}>{adr.address} </Option>
                                                ))}

                                            </Select>
                                        </Form.Item>
                                        <Form.Item name="FintechId"
                                            rules={[{ message: 'Fintech ID required', },]} >
                                            <Input name='FintechId' value={name} disabled={true} type="number" placeholder={name} className='form-input' prefix={<i className='prefix'>&#xf155;</i>}/>
                                        </Form.Item>
                                        <Form.Item name="fintechName"
                                            rules={[{ message: 'Fintech Name required', },]} >
                                            <Input name='fintechName' value={Id} disabled={true} type="text" placeholder={Id} className='form-input' prefix={<i className='prefix'>&#xf155;</i>}/>
                                        </Form.Item>
                                        <Form.Item
                                            name="nroPrestamo"
                                            rules={[
                                                {
                                                    required: true,
                                                    pattern: new RegExp(/^[0-9\b]+$/),
                                                    message: 'Loan name required',
                                                },
                                            ]}
                                        >
                                            <Input value={state.nroPrestamo} onChange={handleChange} name='nroPrestamo' type="number" placeholder='  Loan number' className='form-input' prefix={<i className='prefix'>&#xf007;</i>}/>
                                        </Form.Item>
                                        <Form.Item name="nroCliente"
                                            rules={[{ required: true, message: 'Add client number', },]} >
                                            <Input name='nroCliente' value={state.nroCliente} onChange={handleChange} type="number" placeholder=' Client number' className='form-input' prefix={<i className='prefix'>&#xf162;</i>} />
                                        </Form.Item>

                                        <Form.Item name="nameNFT"
                                            rules={[{ required: true, message: 'NFT Name required', },]} >
                                            <Input name='nameNFT' value={state.nombre} onChange={handleChange} placeholder=' NFT Name' className='form-input' prefix={<i className='prefix'>&#xf007;</i>}/>
                                        </Form.Item>


                                        <Form.Item name="description"
                                            rules={[{ required: true, message: 'Description required', },]} >
                                            <Input name='description' value={state.description} onChange={handleChange} placeholder=' Description' className='form-input' prefix={<i className='prefix'>&#xf2bb;</i>}/>
                                        </Form.Item>

                                        <Form.Item name="titular"
                                            rules={[{ required: true, message: 'Owner name required', },]} >
                                            <Input name='titular' value={state.titular} onChange={handleChange} placeholder=' Owner Name' className='form-input' prefix={<i className='prefix'>&#xf007;</i>}/>
                                        </Form.Item>

                                <Form.Item name="fecha"
                                    rules={[{ required: true, message: 'Date required', },]} >
                                    <DatePicker format='DD-MM-YYYY' name='fecha' value={state.fecha} onChange={handleDatePicker} placeholder=' Date' className='form-input' />
                                </Form.Item>
                                

                                        <Form.Item name="fechaPrimerVencimiento"
                                            rules={[{ required: true, message: 'Date required', },]} >
                                            <DatePicker format='DD-MM-YYYY' name='fechaPrimerVencimiento' value={state.fechaPrimerVencimiento} onChange={handleDatePickerExp} placeholder='First expiration date' className='form-input' />
                                        </Form.Item>
                                        


                                    </Grid>
                                    <Grid item xs={6}>



                                    <Form.Item name="CUIL"
                                            rules={[{
                                                required: true,
                                                pattern: new RegExp(/^(20|23|27|30|33)([0-9]{9}|-[0-9]{8}-[0-9]{1})$/g),
                                                message: 'add a valid CUIL',
                                            },]} >
                                            <Input name='cuil' value={state.cuil} onChange={handleChange} placeholder=' CUIL' className='form-input' prefix={<i className='prefix'>&#xf007;</i>}/>
                                        </Form.Item>
                                        <Form.Item name="direccion"
                                            rules={[{ required: true, message: 'Add an address', },]} >
                                            <Input name='direccion' value={state.direccion} onChange={handleChange} placeholder=' Address' className='form-input' prefix={<i className='prefix'>&#xf041;</i>}/>
                                        </Form.Item>

                                        <Form.Item name="email"
                                            rules={[{ required: true, type: "email", message: 'Add a valid Email', },]} >
                                            <Input name='email' value={state.email} onChange={handleChange} placeholder=' Email' className='form-input' prefix={<i className='prefix'>&#xf0e0;</i>}/>
                                        </Form.Item>
                                        <Form.Item name="celular"
                                            rules={[{ required: true, message: 'Add a valid phone', },]} >
                                            <Input name='celular' value={state.celular} onChange={handleChange} type="number" placeholder=' Phone' className='form-input' prefix={<i className='prefix'>&#xf10b;</i>}/>
                                        </Form.Item>


                                        <Form.Item name="monto"
                                            rules={[{ required: true, message: 'Add the loan amount', },]} >
                                            <Input name='monto' value={state.monto} onChange={handleChange} type="number" placeholder='Loan Amount' className='form-input' prefix={<i className='prefix'>&#xf155;</i>}/>
                                        </Form.Item>

                                        <Form.Item
                                            name="nroCuotas"

                                            rules={[
                                                {
                                                    required: true,
                                                },
                                            ]}
                                        >
                                            <Select
                                                labelInValue
                                                
                                                placeholder=" Amount of fees"
                                                name='nroCuotas' onChange={handleCuotas}
                                                allowClear
                                                className='form-input fake-select'
                                                suffixIcon={<Icon className='prefix-down'>&#xf155;</Icon>}
                                                
                                            >
                                                <Option value="3">3</Option>
                                                <Option value="6">6</Option>
                                                <Option value="9">9</Option>
                                                <Option value="12">12</Option>
                                                <Option value="24">24</Option>
                                                <Option value="36">36</Option>
                                                <Option value="48">48</Option>
                                            </Select>
                                        </Form.Item>


                                        <Form.Item name="valorcuota"
                                            rules={[{ required: true, message: 'Value of Fees', },]} >
                                            <Input name='valorCuota' value={state.valorCuota} onChange={handleChange} type="number" placeholder=' Value of Fees' className='form-input' prefix={<i className='prefix'>&#xf155;</i>}/>
                                        </Form.Item>


                                        <Form.Item

                                            rules={[{ message: 'Add an image for the contract', },]}
                                        >
                                            <div className='fake-input'>
                                            <i class="fas fa-images"></i>
                                                <p className='style-mintNFT'>{fileUrl ? "Image Loaded" : "Select Image"}</p>
                                                <label htmlFor="filePicker" className='label-input'>
                                                    Image Upload
                                                </label>
                                            </div>

                                            <Input
                                                name="imagen"
                                                type="file"
                                                onChange={onChange}
                                                value={state.imagen}
                                                disabled={loadingImg}
                                                className='form-input'
                                                id="filePicker" style={{ display: 'none' }}


                                            />
                                            {/* {loadingImg && (
                                                <i
                                                    className="fa fa-refresh fa-spin"
                                                    style={{ marginRight: "5px" }}
                                                />
                                            )}
                                            {
                                                fileUrl && (
                                                    <img src={fileUrl} width="250px" />
                                                )
                                            }
 */}

                                        </Form.Item>




                                        <Form.Item

                                            rules={[{ message: 'Ingrese un archivo PDF para el contrato', },]}
                                        >

                                            <div className='fake-input'>
                                            <i class="fas fa-file-pdf " ></i>
                                                <p className='style-mintNFT'>{pdfUrl ? "PDF Loaded" : "Select PDF"}</p>
                                                <label htmlFor="pdfPicker" className='label-input'>
                                                   PDF Upload
                                                </label>
                                            </div>
                                            <Input
                                                name="pdf"
                                                type="file"
                                                onChange={onChangePdf}
                                                value={state.pdf}
                                                disabled={loadingPdf}
                                                className='form-input'
                                                id="pdfPicker" style={{ display : "none" }}

                                            />
                                            {/* {loadingPdf && (
                                                <i
                                                    className="fa fa-refresh fa-spin"
                                                    style={{ marginRight: "5px" }}
                                                />
                                            )}
                                            {
                                                pdfUrl && (
                                                    <p> {pdfUrl} </p>
                                                )
                                            } */}



                                        </Form.Item>


                                        <Form.Item

                                        >
                                            <Button type="primary" htmlType="submit" className='button-input'>
                                                <b>Mint NFT</b>
                                            </Button>
                                        </Form.Item>
                                    </Grid>

                                </Grid>




                            </Form>


                            <input id="filePicker" style={{ visibility: "hidden" }} type={"file"}></input>

                        </div>
                    </Page>
                </div>

            ) : (
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open
                >
                    <CircularProgress color="inherit" />
                    <h3>  &nbsp; &nbsp; Processing transaction, please wait...</h3>
                </Backdrop>
            )}
        </Container>
    )
}

export default MintNFT