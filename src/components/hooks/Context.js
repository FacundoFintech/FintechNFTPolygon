import {useContext} from "react";

export const miContext = React.createContext();

export const miProvider = (props) => {

    const [nfts, setNfts] = useState(null);

    setNfts(await Promise.all(addresses.map(async address => {
        return await contract.methods.getNftsInAddress(address).call() 
    })))
  
    return (
      <miContext.Provider value={[nfts]}>
        {props.children}
      </miContext.Provider>
    )
}