import React, {useState, useEffect} from 'react';
import { Redirect } from 'react-router-dom';
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Input, Row, Col } from "antd";
import Button from "@mui/material/Button";
import "./styles/FintechList.css";
import Moralis from 'moralis';
import {contractAbi, CONTRACT_ADDRESS} from '../abi';

async function event(){
  const web3 = await Moralis.enableWeb3();
  const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
  contract.events.eventFintech(function(error, event){ console.log(event); })
  .on('data', function(event){
      console.log(event); // same results as the optional callback above
      window.location.reload()
  })
  .on('changed', function(event){
      // remove event from local database
  })
  .on('error', console.error);
}

const FintechList = () => {

  const [id,setId] = React.useState("")
  const [address,setAddress] = React.useState("")
  const [addresses,setAddresses] = React.useState([])
  const [financieras, setFinancieras] = React.useState([]);

  event()

  async function add(){
    const web3 = await Moralis.enableWeb3();
    let currentUser = Moralis.User.current(); 

    const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
    await contract.methods.agregarFinanciera(address, id).send({from: currentUser.attributes.ethAddress})
  }

  async function deleteFintech(idFinanciera){
    const web3 = await Moralis.enableWeb3();
    let currentUser = Moralis.User.current();
    
    const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
    await contract.methods.removeFinanciera(idFinanciera).send({from: currentUser.attributes.ethAddress})
  }
      
  async function getFinancieras(){
    //let addr = []
    const web3 = await Moralis.enableWeb3();
    const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
    const ids = await contract.methods.getArrayIdsFintech().call()
    const addresses = await Promise.all(ids.map(async id => {
      return await contract.methods.getAddressFinanciera(id).call()
    }))
    const nfts = await Promise.all(addresses.map(async address => {
      return await contract.methods.getNftsInAddress(address).call()
    }))
    console.log(nfts)

    var c = ids.map(function(e, i) {
      return [e, addresses[i], nfts[i].length];
    });
    console.log(c)
    setAddresses(c)
  }

  useEffect(()=>{
    getFinancieras();
  },[])

  useEffect(()=>{
    //Aca recorres el array addresses y piden la data que falta
    
    setFinancieras(addresses.map(a=>({
      id : a[0], //.toString(),
      address : a[1],
      nft: a[2],
    })));

  },[addresses])

const handleIdChange  = (e) => {
  setId(e.target.value)
}


const handleAddressChange = (e) => {
  setAddress(e.target.value)
}

const showNFTDetails = (nfts) => {
  //setNftToSend(nft);
  //setVisibility(true);
  console.log(nfts)
  
  // setNFT(nft)
  // push(`/nft/${nft.token_id}`);
};

  return (
    <>
      <Stack spacing={2} justifyContent="left">
        <h1 className="title">Administrador</h1>
        <h1 className="subtitle">Lista de Fintechs</h1>

        <TableContainer component={Paper}>
          <Table
            sx={{ minWidth: 650, maxWidth: 850 }}
            aria-label="simple table"
          >
            <TableHead>
              <TableRow component="th">
              
                <TableCell
                  align="center"
                  style={{ border: "1px solid gray", fontWeight: "700" }}
                >
                  Fintech ID
                </TableCell>
                <TableCell
                  align="center"
                  style={{ border: "1px solid gray", fontWeight: "700" }}
                >
                  Address
                </TableCell>
                <TableCell
                  align="center"
                  style={{ border: "1px solid gray", fontWeight: "700" }}
                >
                  Cantidad de NFT
                </TableCell>
                <TableCell
                  align="center"
                  style={{ border: "1px solid gray", fontWeight: "700" }}
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody id="tableBody">
              {financieras.map((row) => (
                <TableRow
                  key={row.nombre}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  
                  <TableCell align="center" component="tr">
                    {row.id}
                  </TableCell>
                  <TableCell align="center" component="tr">
                    {row.address}
                  </TableCell>
                  <TableCell align="center" component="tr">
                    {row.nft}
                  </TableCell>
                  <TableCell align="center" component="tr">
                    <Button
                      shape="round"
                      type="primary"
                      style={{ marginRight: "20px" }}
                      onClick={() => showNFTDetails(row.nft)}
                    >
                      Ver NFT
                    </Button>
                    <Button color="error" onClick={() => deleteFintech(parseInt(row.id))}>Borrar Fintech</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <br />
        <h3>Gestión de Fintech</h3>
        <h4>Fintechs</h4>
        <Stack direction="row" spacing={2}>


          <Row
            span={6}
            style={{ marginRight: "20px", border: "1px solid gray" }}
          >
            <Input id="address" placeholder="Address" onChange={handleAddressChange}/>
          </Row>

          <Row
            span={6}
            style={{ marginRight: "20px", border: "1px solid gray" }}
          >
            <Input id='id' placeholder="Fintech ID" onChange={handleIdChange}/>
          </Row>

          <Row span={6} style={{ marginRight: "20px" }}>
            <Button variant="contained" shape="round" onClick={add}>
              Ingresar Financiera
            </Button>
          </Row>
        </Stack>
      </Stack>
    </>
  );
};

export default FintechList;



/**
 * 
 *  async / await 
 * 
 *  
 * async function foo(){
 * 
 *  //promse.then((res)=>{})
 *  //const rest = await promise
 * }
 * 
 * const resultado = foo()
 * 
 * 
 */
