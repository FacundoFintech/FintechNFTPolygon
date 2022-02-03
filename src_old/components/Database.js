import Moralis from 'moralis';



const Database = () => {

    
async function defineNewObject() {
    const Minter = Moralis.Object.extend("Minters");
    const minter = new Minter();
    minter.set( 'name', 'mintero');
    minter.set( 'address', '0xe611111111 ');
    await minter.save();
}

    return (
        <div>
            <h1>Hola</h1>
        </div>
    )
}

export default Database
