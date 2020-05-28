import React from 'react';
import { View, Text } from 'react-native';

export default class Profile extends React.Component {
	constructor(props) {
		super(props);
		this.auth = this.props.auth;
		this.state = {};
	}

	render() {
		return (
			<View>
				<Text>Hello World!</Text>
			</View>
		);
	}
}
