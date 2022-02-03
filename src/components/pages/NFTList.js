import { useState, useEffect } from "react"
import Page from "../Page"
import { useParams, Link } from "react-router-dom"
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Button } from 'react-bootstrap';
import Paper from "@mui/material/Paper";
import { useMoralis, useMoralisQuery, useMoralisCloudFunction } from "react-moralis"
import { contractAbi, CONTRACT_ADDRESS } from "../../abi"
import useAuth from "../hooks/useAuth";
import { useNFTBalances } from "react-moralis";
import Moralis from "moralis";
import '../../Tables.css';
import ViewListIcon from '@mui/icons-material/ViewList';
import AppsIcon from '@mui/icons-material/Apps';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { Container } from "react-bootstrap";
import TablePagination from '@mui/material/TablePagination';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TableFooter from '@mui/material/TableFooter';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import PropTypes from 'prop-types';
import { useRadioGroup } from "@mui/material";



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

const NFTList = () => {

    const { id: fintechAddress } = useParams()
    const { web3 } = useMoralis()
    const [datos, setDatos] = useState([])
    const [order, setOrder] = useState('Fecha');
    const [orden, setOrden] = useState('asc');
    const [nombre, setNombre] = useState("")
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [page, setPage] = useState(0)
    const [ids, setIds] = useState([])

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - datos.length) : 0;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

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

    //ordenamiento

    console.log("los datos!", ...datos)
    const sorting = (col) => {
        if (orden === "asc") {
            console.log("mis datos!!!", datos)
            const sorted = [datos].sort((a, b) =>
                // a.attributes?.[col].toLowerCase() > b.attributes?.[col].toLowerCase() ? 1 : -1
                // a[attributes?.col].toLowerCase() > b[attributes?.col].toLowerCase() ? 1 : -1
                a[col].toLowerCase() > b[col].toLowerCase() ? 1 : -1
            )
            setDatos(sorted)
            setOrden("dsc")
        }
        if (orden === "dsc") {
            const sorted = [datos].sort((a, b) =>
                a.attributes?.[col].toLowerCase() < b.attributes?.[col].toLowerCase() ? 1 : -1
                // a[col].toLowerCase() < b[col].toLowerCase() ? 1 : -1
            )
            setDatos(sorted)
            setOrden("asc")
        }
    }


    //const { user: {moralisInterface}, role} = useAuth()
    const { user: { moralisInterface: user, role: rol, isAdmin } } = useAuth()
    //const {user: usuario} = useAuth()
    //console.log(usuario)
    console.log(user)
    console.log(rol)
    console.log(user.attributes.ethAddress)


    





    const tokens = async () => {
        try {
            const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
            let data
            if (!isAdmin) {
                data = await contract.methods.getFintech(user.attributes.ethAddress).call()
            }
            else {
                data = await contract.methods.getFintech(fintechAddress).call()
            }
            setNombre(data?.fintechName)
            const tokens = data?.nfts
            console.log(tokens)
            const parsed_tokens = tokens.map(t => Number(t))
            setIds(parsed_tokens)
            user['tokens'] = parsed_tokens
            const Metadata = Moralis.Object.extend("Metadata")
            const query = new Moralis.Query(Metadata)
            query.exists("TokenId")
            query.containedIn("TokenId", parsed_tokens)
            const resultado = await query.find()
            console.log(parsed_tokens)
            console.log(resultado)
            setDatos(resultado)
        } catch (e) {
            console.log(e)
        }
    }

    console.log(user)

    useEffect(() => {
        tokens()
    }, [])

    const handleFilter = (event) => {
        setOrder(event.target.value);
    };
    

    return (
        <Container>
            {/* <div className="container-site"> */}
            <Page id="nft-list-page" title={nombre}>
                <div className="page-subsection">
                    <h2>NFTs List</h2>
                    <Grid container className="grid-order">
                        <Grid className="grid-order-child primero"/* xs={3} sm={2} */>
                            <h3 className="ordenar-por">Order by</h3>
                        </Grid>
                        <Grid className="grid-order-child"/* xs={7} sm={8} */>
                            <Select

                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={order}
                                label="Age"
                                className='filter'
                                onChange={handleFilter}
                                size="small"
                            >
                                <MenuItem value={'Fecha'} >Date</MenuItem>
                                <MenuItem value={'Index'}>Index</MenuItem>
                                <MenuItem value={'Descripcion'}>Description</MenuItem>
                            </Select>
                        </Grid>
                        <div className="separador"/>
                        <Grid className="grid-order-child-icons"/* xs={2} sm={2} */>
                            <Link to={`/nft-detail/`}>
                                <ViewListIcon className="icons" fontSize='large' />
                            </Link>
                            <Link to={`/gridnft/`}>
                                <AppsIcon className="icons" fontSize='large' />
                            </Link>
                        </Grid>
                    </Grid>
                    <br />
                    <TableContainer component={Paper} className="table-style">
                        <Table aria-label="simple table" size='small'>
                            <TableHead>
                                <StyledTableRow>
                                    <StyledTableCell align="center" className="tHead" onClick={() => sorting("TokenId")}>Token ID</StyledTableCell>
                                    <StyledTableCell align="center" className="tHead" onClick={() => sorting("LoanId")}>Loan Number</StyledTableCell>
                                    <StyledTableCell align="center" className="tHead" onClick={() => sorting("FullName")}>Name</StyledTableCell>
                                    <StyledTableCell align="center" className="tHead" onClick={() => sorting("CUIL")}>CUIL</StyledTableCell>
                                    <StyledTableCell align="center" className="tHead" onClick={() => sorting("Email")}>Email</StyledTableCell>
                                    <StyledTableCell align="center" className="tHead" onClick={() => sorting("Celular")}>Phone</StyledTableCell>
                                    <StyledTableCell align="center" className="tHead" onClick={() => sorting("MontoPrestamo")}>Amount</StyledTableCell>
                                    <StyledTableCell align="center" className="tHead" onClick={() => sorting("CantidadCuotas")}>Fees Amount</StyledTableCell>
                                    <StyledTableCell align="center" className="tHead">Actions</StyledTableCell>
                                </StyledTableRow>
                            </TableHead>
                            <TableBody>
                                {(rowsPerPage > 0 ? datos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                        : datos
                                                    ).map((nft) => (
                                    <StyledTableRow
                                        component="tr"
                                        key={nft.attributes?.LoanId}
                                        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                    >
                                        <StyledTableCell component="td" align="center" >
                                            {nft.attributes?.TokenId}
                                        </StyledTableCell>
                                        <StyledTableCell component="td" align="center" >
                                            {nft.attributes?.LoanId}
                                        </StyledTableCell>
                                        <StyledTableCell component="td" align="center" >
                                            {nft.attributes?.FullName}
                                        </StyledTableCell>
                                        <StyledTableCell component="td" align="center" >
                                            {nft.attributes?.CUIL}
                                        </StyledTableCell>
                                        <StyledTableCell component="td" align="center" >
                                            {nft.attributes?.Email}
                                        </StyledTableCell>
                                        <StyledTableCell component="td" align="center" >
                                            {nft.attributes?.Celular}
                                        </StyledTableCell>
                                        <StyledTableCell component="td" align="center" >
                                            {nft.attributes?.MontoPrestamo}
                                        </StyledTableCell>
                                        <StyledTableCell component="td" align="center" >
                                            {nft.attributes?.CantidadCuotas}
                                        </StyledTableCell>
                                        <StyledTableCell component="td" align="center">
                                            <Button
                                                className="btn-verNFT"
                                                shape="round"
                                                type="primary"
                                                style={{ marginRight: "20px" }}
                                                onClick={console.log}
                                            >
                                                <Link to={`/nft-detail/${nft.attributes?.TokenId}`} className="btn-link-verNFT">
                                                    Details
                                                </Link>
                                            </Button>
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
                    <div className="pagination">
                    <Stack spacing={2} className="stack">
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                            colSpan={3}
                            count={datos.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            ActionsComponent={TablePaginationActions}
                        />
                    </Stack>
                    </div>
                </div>
            </Page>
            {/* </div> */}
        </Container>
    );
}

export default NFTList
