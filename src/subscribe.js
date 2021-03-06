import {Component, createElement} from 'react';
import PropTypes from 'prop-types';
import omit from 'object.omit';
var uniqid = require('uniqid');

function parse(message) {
    try {
        const item = JSON.parse(message);
        return item;
    } catch (e) {
        return message.toString();
    }
}

function defaultDispatch(topic, message, packet) {
    const { state } = this;
    const m = parse(message);
    this.setState({ message: m, topic: topic, packet: packet, mid: uniqid() });
}


export default function subscribe(opts = { dispatch: defaultDispatch }) {
    const { topic } = opts;
    const dispatch = (opts.dispatch) ? opts.dispatch : defaultDispatch;

    return (TargetComponent) => {
        class MQTTSubscriber extends Component {
            static propTypes = {
                client: PropTypes.object
            }
            static contextTypes = {
                mqtt: PropTypes.object
            };

            constructor(props, context) {
                super(props, context);

                this.client = props.client || context.mqtt;
                this.state = {
                    subscribed: false,
                    message: "",
                    topic: "",
                    mid: "",
                    packet: {}
                };
                this.handler = dispatch.bind(this);
                this.client.on('message', this.handler);
            }

            componentWillReceiveProps(nextProps, nextState){
                if (!this.state.subscribed){
                    this.subscribe();
                }
            }

            componentWillUnmount() {
                this.unsubscribe();
            }

            subscribe() {
                this.client.subscribe(topic);
                this.setState({ subscribed: true });
            }

            unsubscribe() {
                this.client.unsubscribe(topic);
                this.setState({ subscribed: false });
            }

            render() {
                return createElement(TargetComponent, {
                    ...omit(this.props, 'client'),
                    message: this.state.message,
                    topic: this.state.topic,
                    packet: this.state.packet,
                    mid: this.state.mid,
                    mqtt: this.client
                });
            }
        }
        return MQTTSubscriber;
    };
}