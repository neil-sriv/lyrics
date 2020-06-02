import React from 'react';
import { View, Text, Image } from 'react-native';

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
				info: JSON.parse(user).display_name,
				image_url: JSON.parse(user).images[0].url,
				artists: [JSON.parse(artists).items[0].name, JSON.parse(artists).items[1].name, JSON.parse(artists).items[2].name],
				tracks: [JSON.parse(tracks).items[0].name, JSON.parse(tracks).items[1].name, JSON.parse(tracks).items[2].name]
			}
		})
		console.log(this.state.user.image_url)
	}

	render() {
		return (
			<View>

				<View>
					<Text>{this.state.user==null ? 'null' : this.state.user.info}</Text>
				</View>
				<View style={{
					backgroundColor: 'black',
					height: 150,
					width: 150,
					alignItems: 'center',
					justifyContent: 'center',
					borderColor: 'white',
					borderWidth: 85,
					borderRadius: 10,
				}}>
					<Image 
						source={{ uri : `data:${this.state.image_url}` }}
						style={{ height: 150, width: 150 }}
					/>				
				</View>

				<View>
					<Text>{this.state.user==null ? 'null' : this.state.user.artists}</Text>
					
					<Text>{this.state.user==null ? 'null' : this.state.user.tracks}</Text>
				</View>
			</View>
		);
	}
}
