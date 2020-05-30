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
					style={styles.scrollView}
					ref={(ref) => {
						this.scrollView = ref;
					}}
					onContentSizeChange={() =>
						this.scrollView.scrollTo({ x: 0, y: 0, animated: true })
					}
				>
					<Text
						style={{
							color: 'black',
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
		marginHorizontal: 10,
		marginTop: 10,
		height: 200,
		alignSelf: 'stretch',
	},
});
