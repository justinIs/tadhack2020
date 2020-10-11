import React from 'react'
import {render} from 'react-dom'
import {
    Container,
    Row,
    Col,
    InputGroup,
    FormControl,
    Button,
    Table
} from 'react-bootstrap'
import Home from './Home'
import Phone from './Phone'
import './global'
import 'bootstrap/dist/css/bootstrap.min.css'

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            callLogs: []
        }
    }

    async componentDidMount() {
        const response = await fetch('/api/callLogs')
        const json = await response.json()
        this.setState({
            callLogs: json.callLogs
        })
    }

    render() {
        const usePhone = window.location.search.indexOf('phone=true') >= 0

        const callLogs = this.state.callLogs.map(callLog =>
            <tr>
                <td>{callLog.phoneNumber}</td>
                <td>{callLog.insights}</td>
                <td>{callLog.transcript.transcript}</td>
            </tr>
        )

        //usePhone ? <Phone /> : <Home />
        return (
            <Container className="text-center">
                <Row>
                    <Col><h1>Missed Calls</h1></Col>
                </Row>
                {/*<Row className="justify-content-center">*/}
                {/*    <Col md="auto">*/}
                {/*        <InputGroup>*/}
                {/*            <FormControl*/}
                {/*                placeholder="Recipient's Phone Number"*/}
                {/*                id="recipientPhoneNumber"*/}
                {/*                type="tel"*/}
                {/*                value={this.state.recipientPhoneNumber}*/}
                {/*                onChange={event => this.handleRecipientNumberChange(event)}*/}
                {/*            />*/}
                {/*        </InputGroup>*/}
                {/*    </Col>*/}
                {/*    <Col md="auto">*/}
                {/*        <Button onClick={() => this.requestPhoneCall()}>Submit</Button>*/}
                {/*    </Col>*/}
                {/*</Row>*/}
                <Row className="justify-content-center">
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Phone Number</th>
                            <th>Actions</th>
                            <th>Transcript</th>
                            <th>Meeting Link</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>+16306772468</td>
                            <td>Do the Dishes</td>
                            <td>Hi I'm calling into ask if you can just do the dishes</td>
                            <td>https://webrtcventures.azurewebsites.net/?groupId=366d1c40-0b58-11eb-b807-d1243be537363das</td>
                        </tr>
                        {callLogs}
                        </tbody>
                    </Table>
                </Row>
            </Container>
        );
    }
}

render(<App />, document.getElementById('app'))
