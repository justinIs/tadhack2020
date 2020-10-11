import React from "react";
import {Container, Row, Col} from "react-bootstrap";

export default class Home extends React.Component {
    constructor(props) {
        super(props);

        this.remoteVideo = React.createRef()
        this.localVideo = React.createRef()
    }

    componentDidMount() {
        function hasUserMedia() {
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
                || navigator.mozGetUserMedia || navigator.msGetUserMedia;
            return !!navigator.getUserMedia;
        }

        if (hasUserMedia()) {
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
                || navigator.mediaDevices.getUserMedia || navigator.msGetUserMedia;

            //get both video and audio streams from user's camera
            navigator.getUserMedia({video: true, audio: true}, stream => {
                this.localVideo.current.srcObject = stream
            }, err => alert(e));
        } else {
            alert("Error. WebRTC is not supported!");
        }
    }

    render() {
        return (
            <Container>
                <Row className="text-center">
                    <Col>Call a Pal</Col>
                </Row>
                <Row>
                    <Col>
                        <video ref={this.remoteVideo} />
                    </Col>
                    <Col>
                        <video ref={this.localVideo} muted="muted" />
                    </Col>
                </Row>
            </Container>
        )
    }
}
