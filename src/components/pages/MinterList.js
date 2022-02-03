import { useEffect, useState } from "react"
import { Form, Input } from "antd";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Button } from 'react-bootstrap';
import Paper from "@mui/material/Paper";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useMoralis } from "react-moralis";
import { contractAbi, CONTRACT_ADDRESS } from "../../abi"
import Page from "../Page";
import useAuth from "../hooks/useAuth"
import Moralis from 'moralis';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import '../../Tables.css';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined';
import Stack from '@mui/material/Stack';
import { Container } from "react-bootstrap"


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

const color = "#663DBD";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: color,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));


const MinterList = () => {

    const { web3 } = useMoralis()
    const { user: { moralisInterface: user } } = useAuth()
    const [minters, setMinters] = useState([]);
    const [referencia, setReferencia] = useState("")
    const [address, setAddress] = useState("")
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [order, setOrder] = useState('Fecha');


    //Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - minters.length) : 0;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    event();

    const handleFilter = (event) => {
        setOrder(event.target.value);
    };

    const getMinters = async () => {
        let i = 0
        const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
        const receipt = await contract.methods.getVecMintersAddress().call()
        console.log('contract :' + contract + i)
        setMinters(receipt.map(([address, id]) => ({
            id: id,
            address: address,
            index: i++
        })))
    }

    const deleteMinter = async (address, i) => {
        setLoading(true)
        const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
        const receipt = await contract.methods.removeMinterRole(address, i).send({ from: user.attributes.ethAddress })
            .on('error', function (error, receipt) {
                console.log('error: ', error)
                //window.location.reload()
            })

    }

    const add = async () => {
        setLoading(true)
        const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
        const receipt = await contract.methods.setMinterRole(address, referencia).send({ from: user.attributes.ethAddress })
    }

    const handleReferenciaChange = (e) => {
        setReferencia(e.target.value)
    }

    const handleAddressChange = (e) => {
        setAddress(e.target.value)
    }

    useEffect(() => {
        getMinters()
    }, [])


    return (
        <>
            {!loading ? (
                <Container>
                <div className="container-site">
                    <Page title={user.attributes.accounts} id="minter-list-page">
                        <div className="page-subsection">
                            <h2>Minter List</h2>

                        </div>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={12} lg={9}>
                                <TableContainer component={Paper} className="table-style">
                                    <Table aria-label="simple table" size='small'>
                                        <TableHead>
                                            <StyledTableRow>
                                                <StyledTableCell align="center" className="tHead">Index</StyledTableCell>
                                                <StyledTableCell align="center" className="tHead">Description</StyledTableCell>
                                                <StyledTableCell align="center" className="tHead">Address</StyledTableCell>
                                                <StyledTableCell align="center" className="tHead">Actions</StyledTableCell>
                                            </StyledTableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(rowsPerPage > 0 ? minters.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                : minters
                                            ).map((minter) => (
                                                <StyledTableRow
                                                    component="tr"
                                                    key={minter.id}
                                                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                                >
                                                    <StyledTableCell component="td" align="center" >
                                                        {minter.index}
                                                    </StyledTableCell>
                                                    <StyledTableCell component="td" align="center" >
                                                        {minter.id}
                                                    </StyledTableCell>
                                                    <StyledTableCell component="td" align="center" >
                                                        {minter.address} <a href='#' onClick={() => navigator.clipboard.writeText(minter.address)} ><ContentCopyIcon className="contentCopy" /></a>

                                                    </StyledTableCell>
                                                    <StyledTableCell component="td" align="center">
                                                        <Button variant="danger" onClick={() => deleteMinter(minter.address, minter.index)}>
                                                            Delete
                                                        </Button>
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                            ))}
                                        </TableBody>

                                    </Table>
                                </TableContainer>
                                <div className="pagination">
                                    <Stack spacing={2} className="stack">
                                        <TablePagination
                                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                            colSpan={3}
                                            count={minters.length}
                                            rowsPerPage={rowsPerPage}
                                            page={page}

                                            onPageChange={handleChangePage}
                                            onRowsPerPageChange={handleChangeRowsPerPage}
                                            ActionsComponent={TablePaginationActions}
                                        />
                                    </Stack>
                                </div>
                            </Grid>
                            <Grid item xs={12} md={12} lg={3}>
                                <div >
                                    <Form form={form} id="financiera-form" name="horizontal_login" layout="horizontal"  >
                                        <Card sx={{ minWidth: 275 }} className="card-content">
                                            <CardContent className="form-mgmt">
                                                <Typography className="title-gestion" >
                                                    <AccountBoxOutlinedIcon className="icon-gestion" />Minter Management
                                                </Typography>
                                                <Typography variant="body2">
                                                    <Form.Item
                                                        name="description"

                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Please add a description',
                                                            },
                                                            { min: 5, message: 'The description must have a minimum of 1 character' },
                                                        ]}
                                                    >
                                                        <Input placeholder="Description" id='reference' onChange={handleReferenciaChange} className="inputs" />
                                                    </Form.Item>
                                                </Typography>
                                                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                                    <Form.Item
                                                        name="address"

                                                        rules={[
                                                            {
                                                                required: true,
                                                                pattern: new RegExp(/^0x[a-fA-F0-9]{40}$/),
                                                                message: 'Please add a valid Address',
                                                            },
                                                        ]}
                                                    >
                                                        <Input placeholder="Address" id='address1' onChange={handleAddressChange} className="inputs" />
                                                    </Form.Item>
                                                </Typography>
                                            </CardContent>
                                            <CardActions>
                                                <Form.Item shouldUpdate className="btn-form-item">
                                                    <Button
                                                        className="btn-addFintech"
                                                        type="primary"
                                                        onClick={(add)}
                                                        disabled={
                                                            !form.isFieldsTouched(true) ||
                                                            !!form.getFieldsError().filter(({ errors }) => errors.length).length
                                                        }
                                                    >
                                                        ADD MINTER
                                                    </Button>
                                                </Form.Item>
                                            </CardActions>
                                        </Card>
                                    </Form>
                                </div>
                            </Grid>
                        </Grid>

                    </Page>

                </div>
                </Container>

            ) : (
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open
                >
                    <CircularProgress color="inherit" />
                    <h3>  &nbsp; &nbsp; Processing transaction, please wait...</h3>
                </Backdrop>
            )}
        </>
    );
};

export default MinterList

