import Page from "../Page";
import { Link } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import { styled } from '@mui/material/styles';
import TableRow from "@mui/material/TableRow";
import { Button } from 'react-bootstrap';
import Grid from '@mui/material/Grid';
import Paper from "@mui/material/Paper";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useEffect, useState } from "react";
import { Form, Input } from "antd";
import { useMoralis, useMoralisCloudFunction, useMoralisQuery } from "react-moralis";
import { contractAbi, CONTRACT_ADDRESS } from "../../abi"
import useAuth from "../hooks/useAuth";
import Moralis from 'moralis';
import '../../Tables.css';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined';
import Stack from '@mui/material/Stack';
import { Container } from "react-bootstrap"






async function event() {
    const web3 = await Moralis.enableWeb3();
    const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
    contract.events.eventFintech(function (error, event) { console.log(event); })
        .on("connected", function(subscriptionId){
            console.log(subscriptionId);
        })
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

const bull = (
    <Box
        component="span"
        sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
    >
        •
    </Box>
);

const color = "#663DBD";



const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: color,
        color: theme.palette.common.white,
        margin: 1000,


    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,


    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
        height: 10,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,

    },

}));

function TablePaginationActions(props) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (event) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };



    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
            >
                {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>
        </Box>
    );

}

TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};

const FintechList = () => {
    // const { data, error, isLoading } = useMoralisQuery("Metadata", query =>
    //     query
    //         .equalTo("LoanId", 8)
    //     );
    // console.log(data, error)
    event();
    
    
    const [financieras, setFinancieras] = useState([])
    const [id, setId] = useState("")
    const [nombre, setNombre] = useState('')
    const [address, setAddress] = useState("")
    const { web3 } = useMoralis()
    const { user: { moralisInterface: user } } = useAuth()
    const [form] = Form.useForm();
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [loading, setLoading] = useState(false)
    
    
    
    
    //Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - financieras.length) : 0;
    
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    
    
    
    const handleAddressChange = e => {
        setAddress(e.target.value)
    }
    
    const handleIdChange = e => {
        setId(e.target.value)
    }
    
    const handleNombreChange = e => {
        setNombre(e.target.value)
    }
    
    const add = async () => {
        setLoading(true)
        const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
        await contract.methods.agregarFinanciera(address, id, nombre).send({ from: user.attributes.ethAddress })
        .on('error', function (error, receipt) {
            console.log('error: ', error)
            //window.location.reload()
        })
        //window.location.reload()
    }
    
    
    
    
    async function getFinancieras() {
        
        let i = 0
        const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
        const addresses = await contract.methods.getArrayAddressFintech().call()
        const fintech = await Promise.all(addresses.map(async address => {
            return await contract.methods.getFintech(address).call()
        }))
        console.log(fintech)
        
        var c = addresses.map(function (e, i) {
            return [fintech[i].fintechId, addresses[i], fintech[i].nfts.length, fintech[i].fintechName, fintech[i].isDeleted];
            /* return {
                id: fintech[i].fintechId,
                address: addresses[i],
                nfts: fintech[i].nfts.length,
                name: fintech[i].fintechName,
                isDeleted: fintech[i].isDeleted
            } */
        });
        
        
        
        setFinancieras(c.map(a => ({
            id: a[0],
            address: a[1],
            nft: a[2],
            index: i++,
            name: a[3],
            isDeleted: a[4]
        })));
    }
    
    const deleteFintech = async (address) => {
        setLoading(true)
        const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
        await contract.methods.quitarFinanciera(address).send({ from: user.attributes.ethAddress })
        .on('error', function (error, receipt) {
            console.log('error: ', error)
            //window.location.reload()
        })
            console.log("Elimino fintech")
            //window.location.reload()
    }

    const restoreFintech = async (address) => {
        setLoading(true)
        const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
        await contract.methods.restoreFintech(address).send({ from: user.attributes.ethAddress })
            .on('error', function (error, receipt) {
                console.log('error: ', error)
                //window.location.reload()
            })
            console.log("Restauro fintech")
 
    }

    const currentUser = Moralis.User.current();
    console.log(currentUser)


    useEffect(() => {
        getFinancieras()
    }, [])

    return (
        <>
            {!loading ? (
                <Container>
                        <Grid container spacing={2}>

                            <Grid item xs={12} md={12} lg={9}>
                                <Page title="OWNER" id="fintech-list-page">
                                    <div className="page-subsection">
                                        <h2>Fintechs List</h2>
                                        <TableContainer component={Paper} className="table-style">
                                            <Table aria-label="simple table" size='small'>
                                                <TableHead >
                                                    <StyledTableRow >
                                                        <StyledTableCell align="center" className="tHead">Name</StyledTableCell>
                                                        <StyledTableCell align="center" className="tHead">Fintech ID</StyledTableCell>
                                                        <StyledTableCell align="center" className="tHead">Address</StyledTableCell>
                                                        <StyledTableCell align="center" className="tHead">NFT Amount</StyledTableCell>
                                                        <StyledTableCell align="center" className="tHead"></StyledTableCell>
                                                    </StyledTableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {(rowsPerPage > 0 ? financieras.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                        : financieras
                                                    ).map((financiera) => (
                                                        <StyledTableRow
                                                            component="tr"
                                                            key={financiera.id}
                                                            className={financiera.isDeleted ? "deleted" : "notDeleted"}
                                                            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                                        >
                                                            <StyledTableCell component="td" align="center" >
                                                                {financiera.name}
                                                            </StyledTableCell>
                                                            <StyledTableCell component="td" align="center" >
                                                                {financiera.id}
                                                            </StyledTableCell>
                                                            <StyledTableCell component="td" align="center" >
                                                                {financiera.address} <a href='#' onClick={() => navigator.clipboard.writeText(financiera.address)} ><ContentCopyIcon className="contentCopy" /></a>
                                                            </StyledTableCell>
                                                            <StyledTableCell component="td" align="center" className="nfts-quantity">
                                                                {financiera.nft}
                                                                <Link to={`/nft-list/${financiera.address}`} className="btn-link-verNFT">
                                                                    {!financiera.isDeleted && <Button
                                                                        className="btn-verNFT"
                                                                        variant="outline-primary"
                                                                        style={{ marginLeft: "20px" }}
                                                                    >
                                                                        View
                                                                    </Button>}
                                                                </Link>
                                                            </StyledTableCell>
                                                            <StyledTableCell component="td" align="right">

                                                                {!financiera.isDeleted && <Button variant="danger" className="btn-danger" onClick={() => deleteFintech(financiera.address)}>X</Button>}

                                                                {financiera.isDeleted && <Button className="btn-primary" variant="primary" onClick={() => restoreFintech(financiera.address)}>Activate</Button>}
                                                            </StyledTableCell>
                                                        </StyledTableRow>
                                                    ))}
                                                    {emptyRows > 0 && (
                                                        <StyledTableRow style={{ height: 53 * emptyRows }}>
                                                            <StyledTableCell colSpan={6} />
                                                        </StyledTableRow>
                                                    )}
                                                </TableBody>

                                            </Table>
                                        </TableContainer>

                                        <div className="pagination-fintech">

                                            <Stack spacing={2} className="stack">
                                                <TablePagination
                                                    rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                                    colSpan={3}
                                                    count={financieras.length}
                                                    rowsPerPage={rowsPerPage}
                                                    page={page}
                                                    SelectProps={{
                                                        inputProps: {
                                                            'aria-label': 'rows per page',
                                                        },
                                                        native: true,
                                                    }}
                                                    onPageChange={handleChangePage}
                                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                                    ActionsComponent={TablePaginationActions}

                                                />
                                            </Stack>
                                        </div>
                                    </div>
                                </Page>
                            </Grid>
                            <Grid item xs={12} md={12} lg={3}>
                                <div className="card-div">
                                    <Form form={form} id="financiera-form" name="horizontal_login" layout="horizontal"  >
                                        <Card sx={{ minWidth: 275 }} className="card-content">
                                            <CardContent className="form-mgmt">
                                                <Typography className="title-gestion" >
                                                    <AccountBoxOutlinedIcon className="icon-gestion" />Fintech Management
                                                </Typography>
                                                <Typography variant="body2">
                                                    <Form.Item
                                                        name="nombre"

                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Please add a name to the Fintech',
                                                            },
                                                            { min: 1, message: 'The name needs at least 1 letter.' },
                                                        ]}
                                                    >
                                                        <Input placeholder="Name" id='nombre' onChange={handleNombreChange} className="inputs" />
                                                    </Form.Item>
                                                </Typography>
                                                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                                    <Form.Item
                                                        name="address"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                pattern: new RegExp(/^0x[a-fA-F0-9]{40}$/),
                                                                message: 'Please add a valid address',
                                                            },
                                                        ]}
                                                    >
                                                        <Input placeholder="Address" id='address1' onChange={handleAddressChange} className="inputs" />
                                                    </Form.Item>
                                                </Typography>
                                                <Typography variant="body2">
                                                    <Form.Item
                                                        name="id"

                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Please add a valid ID',
                                                            },
                                                            { min: 1, message: 'The ID must have a minimum of 1 character' },
                                                        ]}
                                                    >
                                                        <Input placeholder="Fintech ID" id='id' onChange={handleIdChange} className="inputs" />
                                                    </Form.Item>
                                                </Typography>

                                            </CardContent>
                                            <CardActions>
                                                <Form.Item shouldUpdate className="btn-form-item btn-addFintech">
                                                    <Button
                                                        className="btn-addFintech"
                                                        id="btn-addFintech"
                                                        type="primary"
                                                        onClick={(add)}
                                                        disabled={
                                                            !form.isFieldsTouched(true) ||
                                                            !!form.getFieldsError().filter(({ errors }) => errors.length).length
                                                        }
                                                    >
                                                        ADD FINTECH
                                                    </Button>
                                                </Form.Item>
                                            </CardActions>
                                        </Card>
                                    </Form>
                                </div>
                            </Grid>
                        </Grid>
                        {/* <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open
            >
                <CircularProgress color="inherit" />
                <h3>Procesando transaccion, por favor espere.</h3>
            </Backdrop> */}
                </Container>
            ) : (
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open
                >
                    <CircularProgress color="inherit" />
                    <h3>  &nbsp; &nbsp; Procesando transaccion, por favor espere.</h3>
                </Backdrop>
            )}
        </>
    );
};

export default FintechList