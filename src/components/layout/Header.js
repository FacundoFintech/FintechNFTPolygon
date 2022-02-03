import React from "react"
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import useAuth from "../hooks/useAuth"
import logo from "../../assets/logodaaps.svg";
import { useMoralis } from 'react-moralis';
import { toast } from 'react-toastify';
import InputUnstyled from '@mui/base/InputUnstyled';
import { styled } from '@mui/system';
import canvas from "../../assets/canvasicon.png"
import LogoutIcon from '@mui/icons-material/Logout';


const Header = () => {

    const { logInToMoralis, user: { moralisInterface: user, role: rol, logged, isAdmin, isFinanciera, isMinter } } = useAuth()
    const { logout } = useMoralis()
    
    let current
    if (logged) {
      current = user.attributes.ethAddress
    }

    const balanceYAccount = () => { }

    const customLogout = () => {
        toast.success("Sesión cerrada")
        logout()
    }

    const blue = {
        200: '#80BFFF',
        400: '#3399FF',
      };
      
      const grey = {
        50: '#F3F6F9',
        100: '#E7EBF0',
        200: '#E0E3E7',
        300: '#CDD2D7',
        400: '#B2BAC2',
        500: '#A0AAB4',
        600: '#6F7E8C',
        700: '#3E5060',
        800: '#2D3843',
        900: '#1A2027',
      };

    const StyledInputElement = styled('input')(
        ({ theme }) => `
        width: 250px;
        font-size: 0.875rem;
        font-family: IBM Plex Sans, sans-serif;
        font-weight: 400;
        line-height: 1.5;
        color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
        background: ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
        border: 1px solid ${theme.palette.mode === 'dark' ? grey[800] : grey[300]};
        border-radius: 8px;
        padding: 12px 12px;
        transition: all 150ms ease;
        padding: 7px;
      
        &:hover {
          background: ${theme.palette.mode === 'dark' ? '' : grey[100]};
          border-color: ${theme.palette.mode === 'dark' ? grey[700] : grey[400]};
        }
      
        &:focus {
          outline: 2px solid ${theme.palette.mode === 'dark' ? blue[400] : blue[200]};
          outline-offset: 2px;
        }
      `,
      );

    const CustomInput = React.forwardRef(function CustomInput(props, ref) {
        return (
          <InputUnstyled components={{ Input: StyledInputElement }} {...props} ref={ref} />
        );
      });

    return (
        <Navbar bg="transparent" expand="lg" as="header" id="layout-header">
            <Container>
                <Navbar.Brand to="/" as={NavLink}>
                    <img id="layout-header-logo" src={logo} width="250px" alt="logo-action-fintech"/>
                </Navbar.Brand>
                {logged ? <div id="cuadrado-logout" className="logout-responsive" onClick={customLogout}>  <i class="fas fa-sign-out-alt"></i><p>LOGOUT</p> </div> : balanceYAccount()}
                {logged && <Navbar.Toggle className='d-lg-none' aria-controls="basic-navbar-nav"/>}
                {logged && <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto navbar-links" >
                        <Nav.Link to="/fintechlist" as={NavLink} hidden = {!isAdmin} >FINTECH</Nav.Link>
                        <Nav.Link to="/minterlist" as={NavLink} hidden = {!isAdmin}>MINTER</Nav.Link>
                        <Nav.Link to={"/nft-list/" + (isFinanciera ? current : isAdmin ? current : "")} as={NavLink} hidden = {!isFinanciera}>NFTs LIST</Nav.Link>
                        <Nav.Link to="/mintnft" as={NavLink}>MINT NFT</Nav.Link>
                        <Nav.Link to="/gridnft" as={NavLink}>MARKETPLACE</Nav.Link>
                    </Nav>
                </Navbar.Collapse>}
                {logged ? <div id="cuadrado-logout" className="logout-desktop" onClick={customLogout}> <i class="fas fa-sign-out-alt"></i> <p>LOGOUT</p> </div> : balanceYAccount()}
                {!logged ? <Button color='primary' onClick={logInToMoralis} id="connect-wallet">CONNECT WALLET</Button> : balanceYAccount()}
            </Container>
        </Navbar>
    )
}

export default Header