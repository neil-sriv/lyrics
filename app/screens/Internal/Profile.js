import React from 'react';
import { View, Text } from 'react-native';

export default class Profile extends React.Component {
	constructor(props) {
		super(props);
		this.auth = this.props.auth;
		this.state = {
			user: {},
		};
	}
	
	async componentDidMount() {
		const user = await this.auth.getUserData('user');
		const artists = await this.auth.getUserData('artists');
		const tracks = await this.auth.getUserData('tracks');
		this.setState({
			user: {
				info: user,
				artist: artists,
				tracks: tracks
			}
		})
	}

	render() {
		return (
			<View>
				<Text>{this.state.user==null ? 'null' : this.state.user.info}</Text>
				<Text>{this.state.user==null ? 'null' : this.state.user.artists}</Text>
				<Text>{this.state.user==null ? 'null' : this.state.user.tracks}</Text>
			</View>
		);
	}
}
