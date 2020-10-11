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

    handleRecipientNumberChange(event) {
        this.setState({
            recipientPhoneNumber: event.target.value
        })
    }

    async requestPhoneCall() {
        console.log(this.state.recipientPhoneNumber)
        const response = await fetch('/api/placeCall', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                phone_number: this.state.recipientPhoneNumber
            })
        })
    }

    render() {
        const callLogs = this.state.callLogs.map(callLog =>
            <tr>
                <td>{(new Date(callLog.time)).toISOString()}</td>
                <td>{callLog.phoneNumber}</td>
                <td>{callLog.insights}</td>
                <td>{callLog.transcript.transcript}</td>
                <td>{callLog.meetingLink}</td>
            </tr>
        )
        return (
            <Container className="text-center">
                <Row>
                    <Col><h1>Missed Calls</h1></Col>
                </Row>
                <Row className="justify-content-center">
                    <Col md="auto">
                        <InputGroup>
                            <FormControl
                                placeholder="Recipient's Phone Number"
                                id="recipientPhoneNumber"
                                type="tel"
                                value={this.state.recipientPhoneNumber}
                                onChange={event => this.handleRecipientNumberChange(event)}
                            />
                        </InputGroup>
                    </Col>
                    <Col md="auto">
                        <Button onClick={() => this.requestPhoneCall()}>Submit</Button>
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Phone Number</th>
                            <th>Actions</th>
                            <th>Transcript</th>
                            <th>Meeting Link</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>{ (new Date()).toISOString() }</td>
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
