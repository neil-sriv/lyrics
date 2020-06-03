import React from 'react';
import { SafeAreaView, ScrollView, Text, StyleSheet } from 'react-native';

export default class Lyrics extends React.Component {
	constructor(props) {
        super(props);
		this.state = {
			lyrics: this.props.lyrics,
        };
    }

	render() {
		return (
			<SafeAreaView style={styles.scrollView}>
				<ScrollView
					ref={(ref) => {
						this.scrollView = ref;
					}}
					onContentSizeChange={() =>
						this.scrollView.scrollTo({ x: 0, y: 0, animated: true })
					}
				>
					<Text
						style={{
							color: '#2AA7E7',
							fontSize: 20,
						}}
					>
						{this.state.lyrics}
					</Text>
				</ScrollView>
			</SafeAreaView>
		);
	}
}

const styles = StyleSheet.create({
	scrollView: {
		// marginHorizontal: 10,
		marginTop: 10,
		height: 300,
		width: 319,
		position: 'relative',
		// backgroundColor: (42, 167, 231, 0.1)
		backgroundColor: 'white',
		borderColor: 'white',
		borderWidth: 10,
		borderRadius: 10,
		shadowColor: 'black',
		shadowOpacity: 0.15,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 0 },
	},
});
