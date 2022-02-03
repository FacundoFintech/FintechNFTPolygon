import { Switch } from 'react-router-dom';
import { PrivateRoute, PublicRoute } from '../CustomRoutes';
import { Container } from 'react-bootstrap';
import routes from '../../rutes';

const Main = () => {
    return (
        <Container fluid as="main" id="layout-main">
            <Switch>
                {routes.map((ruta,i)=> ruta.public ? <PublicRoute key={i} {...ruta} /> : <PrivateRoute key={i} {...ruta} />)}
            </Switch>
        </Container>
    )
}

export default Main
