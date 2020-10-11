import React from 'react'
import {Button, Col, Container, FormControl, InputGroup, Row} from "react-bootstrap";

export default class Home extends React.Component {
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
