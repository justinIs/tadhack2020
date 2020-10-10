import React from 'react'
import {render} from 'react-dom'
import {
    Container,
    Row,
    Col,
    InputGroup,
    FormControl,
    Button
} from 'react-bootstrap'
import './global'
import 'bootstrap/dist/css/bootstrap.min.css'

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            recipientPhoneNumber: ''
        }
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
        return (
            <Container className="text-center">
                <Row>
                    <Col><h1>Hello World from React</h1></Col>
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
            </Container>
        );
    }
}

render(<App />, document.getElementById('app'))
