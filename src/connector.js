import {Component, createElement, Children} from 'react';
import PropTypes from 'prop-types';
import connect from 'mqtt';

export default class Connector extends Component {
    static propTypes = {
        mqtt: PropTypes.object,
        mqttProps: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        mqttOpt: PropTypes.object,
        children: PropTypes.element.isRequired,
    };

    static childContextTypes = {
        mqtt: PropTypes.object,
        mqttStatus: PropTypes.string
    };

    constructor(props, context) {
        super(props, context);

        const initialState = {};
        this.state = initialState;
    }

    getChildContext() {
        return {
            mqtt: this.mqtt,
            mqttStatus: this.state.mqttStatus
        };
    }

    componentWillMount() {
        const { mqttProps, mqttOpt, mqtt } = this.props;

        this.mqtt = (mqtt) ? mqtt : connect(mqttProps, mqttOpt);

        this.mqtt.on('connect', this._makeStatusHandler('connected'));
        this.mqtt.on('reconnect', this._makeStatusHandler('reconnect'));
        this.mqtt.on('close', this._makeStatusHandler('closed'));
        this.mqtt.on('offline', this._makeStatusHandler('offline'));
        this.mqtt.on('error', console.error);


    }

    componentWillUnmount(){
        this.mqtt.end();
    }

    _makeStatusHandler = (status) => {
        return () => {
            this.setState({ mqttStatus: status });
        };
    };

    renderConnected() {
        return Children.only(this.props.children);
    }

    render() {
        return this.renderConnected();
    }
}