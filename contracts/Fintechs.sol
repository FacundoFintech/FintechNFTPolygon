// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MyNFT is ERC721URIStorage, AccessControl {

    uint tokenId;

    //Mapping from token NFT ID to metadata struct.
    mapping (uint => Metadata) private structMetadata;
    //Mapping from fintech addres to fintech info struct
    mapping (address => Fintech) private fintech;
    //Stores address of the fintech added.
    address [] private fintechs;
    //Stores the address of the minter added.
    Minter [] private mintersAddress;

    struct Fintech {
        uint fintechId;
        string fintechName;
        uint [] nfts;
        bool isDeleted;
    }

    struct Metadata {
        uint loanId;
        uint numeroDeCliente;
        uint fintechId;
        string fechaDeCreacion;
        string uriImagen;
        bytes32 hashRegistroBase;
    }

    struct Minter {
        address minterAddress;
        string description;
    }

    //Eventos
    /*************************************************************************************************************************************/

    //Push/Agrego
    //Pop/Quito
    event eventMinter(address indexed _minterAdress, string _description, string _operation);

    //Push/Agrego
    //Pop/Quito
    event eventFintech(address indexed _address, uint _id, string _operation);

    /*************************************************************************************************************************************/


    //Constructor
    /*************************************************************************************************************************************/
    //Se inicializan los roles en forma de hash, a estos luego se les asignan addresses
    //Initialiazing roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant FINANCIERA_ROLE = keccak256("FINANCIERA_ROLE");

    constructor (string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /*************************************************************************************************************************************/


    //Modifiers & verifications
    /*************************************************************************************************************************************/
    
    /**
     *@dev Validates admin role.
     *
     *En caso de que no contenga los permisos se cortará la ejecución y se notificará al usuario
     */
    modifier hasAdminRole(address _adminAddress){
       require(hasRole(DEFAULT_ADMIN_ROLE, _adminAddress), "Error Admin Role");
        _;
    }
    

    /**
     *@dev Implementacion de chequeo de NFT
     *Chequea si el address es minter o no. 
     *En caso de que no contenga los permisos se cortará la ejecución y se notificará al usuario
     */
    modifier hasMinterRole(address _minterAddress){
        require(hasRole(MINTER_ROLE, _minterAddress), "Error Minter Role");
        _;
    }

    /**
     *@dev Implementacion de chequeo de NFT
     *Chequea si el address es financiera o no. 
     *En caso de que no contenga los permisos se cortará la ejecución y se notificará al usuario
     */
    modifier hasFinancieraRole(address _financieraAddress){
        require(hasRole(FINANCIERA_ROLE, _financieraAddress), "Error Fintech Role");
        _;
    }

    /*************************************************************************************************************************************/



    //Setters
    /*************************************************************************************************************************************/


    /**
     * @dev Dado un address se le otorga el rol de minter
     */
    function setMinterRole(address _minterAddress, string memory _description) public hasAdminRole(msg.sender){
        require(!hasRole(MINTER_ROLE, _minterAddress), "Error Minter ya registrado");
        grantRole(MINTER_ROLE, _minterAddress);
        Minter memory auxMinter;
        auxMinter.minterAddress = _minterAddress;
        auxMinter.description = _description;
        mintersAddress.push(auxMinter);
        emit eventMinter(_minterAddress, _description, "New Minter");
        
    }

    /**
     *@dev Implementacion de agregado de permisos a address de financiera
     *El address no debería estar registrado
     *Setea el numero de token de financiera en 1
     */

    function agregarFinanciera (address _address, uint _fintechId, string memory _name) public hasAdminRole(msg.sender){
        //require((!hasRole(FINANCIERA_ROLE, _address) && fintechIdAddress[_fintechId] == 0x0000000000000000000000000000000000000000), "Error Fintech ya registrada"); 

        if (!hasRole(FINANCIERA_ROLE, _address) && fintech[_address].isDeleted == false){
            fintech[_address].fintechId = _fintechId;
            fintech[_address].fintechName = _name;
            fintech[_address].isDeleted = false;
            grantRole(FINANCIERA_ROLE, _address);
            fintechs.push(_address);
            emit eventFintech(_address, _fintechId,"New Fintech");
        }
        else {
            fintech[_address].fintechId = _fintechId;
            fintech[_address].fintechName = _name;
            emit eventFintech(_address, _fintechId,"Update Fintech");
        }
    }

    function restoreFintech (address _address) public hasAdminRole(msg.sender){
        fintech[_address].isDeleted = false;
        grantRole(FINANCIERA_ROLE, _address);
        emit eventFintech(_address, fintech[_address].fintechId, "Restored Fintech");        
    }


    /*************************************************************************************************************************************/





    //Removers
    /*************************************************************************************************************************************/

    /**
     * @dev Dado un address se le quita el rol de minter y lo borra
     */
    function removeMinterRole(address _minterAddress, uint _index) public hasAdminRole(msg.sender) hasMinterRole(_minterAddress){
        emit eventMinter(mintersAddress[_index].minterAddress, mintersAddress[_index].description, "Delete Minter");
        mintersAddress[_index] = mintersAddress[mintersAddress.length-1];
        mintersAddress.pop();
        revokeRole(MINTER_ROLE,_minterAddress);
    }

    /**
     * @dev Dado un address se le quita el rol de financiera
     */
    //function removeFinancieraRole(address _minterAddress) public hasAdminRole(msg.sender){
    //    revokeRole(FINANCIERA_ROLE,_minterAddress);
    //}

    /**
     * @dev Borra una financiera dado su id y su posicion en el array de fintechId
     */
    
    function quitarFinanciera(address _addressFinanciera) public hasAdminRole(msg.sender) hasFinancieraRole(_addressFinanciera){
        fintech[_addressFinanciera].isDeleted = true;
        revokeRole(FINANCIERA_ROLE, _addressFinanciera);
        emit eventFintech(_addressFinanciera, fintech[_addressFinanciera].fintechId, "Delete Fintech");        
    }
    

    /*************************************************************************************************************************************/
    

    //Getters
    /*************************************************************************************************************************************/

    /**
     * @dev Retorna la metadata asociada al tokenId 
     */
    function getMetadata(uint _tokenId) public view returns (Metadata memory){
        return structMetadata[_tokenId];
    }

    /**
     * @dev Retorna los datos de la Fintech
     */
    function getFintech(address _address) public view returns (Fintech memory){
        return fintech[_address];
    }

    /**
     * @dev Retorna el array con las ids de las financieras registradas 
     */
    function getArrayAddressFintech() public view returns(address[] memory){
        return fintechs;
    }
    

    /**
     *@dev Implementacion de retorno de la metadata codificada para todo el array de nfts de la direccion
     *El token debe existir, solo puede ejectutar la cuenta dueña del nft
     *Retorna el hash de la metadata asociado a los tokenID del vector de nfts
     */

    //24/1 comentadp
    //function getMetadataHash(uint _tokenId) public view returns(bytes32){
    //    return structMetadata[_tokenId].hashRegistroBase;
    //}

    /**
     * @dev Retorna el array con los addres de los minters
     */
    function getVecMintersAddress() public view returns(Minter[] memory){
        return mintersAddress;
    }

    /*************************************************************************************************************************************/


    //Transfer
    /*************************************************************************************************************************************/

    /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferNft(address _to, uint _nftId, string memory _name) public hasFinancieraRole(msg.sender) {

        transferFrom(msg.sender, _to, _nftId);

        if (hasRole(FINANCIERA_ROLE, _to)){
            fintech[_to].nfts.push(_nftId);
        }
        else {

            if(fintech[_to].isDeleted == true){
                fintech[_to].nfts.push(_nftId);
                fintech[_to].isDeleted = false; //Llamamos desde el front a restorefintech apenas se confirme la transaccion
                _setupRole(FINANCIERA_ROLE, _to);
            }else{
                fintech[_to].fintechName = _name;
                fintech[_to].nfts.push(_nftId);
                _setupRole(FINANCIERA_ROLE, _to); //Llamamos desde el front a restorefintech apenas se confirme la transaccion
                fintechs.push(_to);
                
                //emit eventFintech(_to, 0,"New Fintech"); //sacamos 24/1 por espacio
            }
            
        }

        //uint [] memory arrayNftsFinanciera = nftsIdsInAddress[msg.sender];
        //uint [] memory arrayNftsFinanciera = fintech[msg.sender].nfts;
        
        for(uint i = 0; i < fintech[msg.sender].nfts.length; i++){
            if (fintech[msg.sender].nfts[i] == _nftId){
                uint aux = fintech[msg.sender].nfts[fintech[msg.sender].nfts.length-1];
                fintech[msg.sender].nfts[i] = aux;
                //nftsIdsInAddress[msg.sender].pop();      //Chequear si al transferir funciona
                fintech[msg.sender].nfts.pop();
                emit eventFintech(_to, _nftId,"Transfer Nft");
                break;
            }
        }
    }

    /*************************************************************************************************************************************/


    //Mint
    /*************************************************************************************************************************************/

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */


    /**
     * @dev See {ERC721/ERC721-_mint}.
     * NOTE: Se agrega al mapeo del tokenid la metadata ingresada previamente
     */

    function mintNFT(address _recipient, string memory _tokenURI, Metadata memory _metadata) public hasFinancieraRole(_recipient) 
     returns (uint){
        if (_recipient != msg.sender){
            require(hasRole(MINTER_ROLE, msg.sender), "Error Minter Role");
        }

        tokenId += 1;
        structMetadata[tokenId] = _metadata;
        fintech[_recipient].nfts.push(tokenId);

        _mint(_recipient, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        emit eventFintech(_recipient, tokenId,"Mint Nft");

        return tokenId;
    }

}
