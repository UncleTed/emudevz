import React, { PureComponent } from "react";
import _ from "lodash";
import codeEval from "../level/codeEval";
import components from "./components";
import layouts from "./components/layouts";
import NavBar from "./components/widgets/NavBar";

class LevelScreen extends PureComponent {
	$timeouts = [];

	render() {
		const { chapter, level } = this.props;

		const Layout = layouts[level.ui.layout];
		const Components = _.mapValues(
			level.ui.components,
			([name]) => components[name]
		);

		return (
			<>
				<Layout {...Components} ref={this.onReady} />
				<NavBar chapter={chapter} level={level} />
			</>
		);
	}

	onReady = async (layout) => {
		if (!layout) return;

		const { level } = this.props;
		level.$layout = layout;

		const initFile = level.ui.run;
		if (initFile != null) {
			const code = level.code[initFile];
			if (code != null) {
				try {
					codeEval.eval(code);
				} catch (e) {
					alert("💥💥💥💥💥");
					console.error(e);
				}
			} else throw new Error(`Code not found: ${initFile}`);
		}

		this.$timeouts.push(
			setTimeout(() => {
				const runningComponents = layout.instances;

				_.forEach(runningComponents, (runningComponent, name) => {
					const [, args] = level.ui.components[name];
					runningComponent.initialize(args, level, layout);
				});

				this.$timeouts.push(
					setTimeout(() => {
						layout.focus(level.ui.focus);
					})
				);
			})
		);
	};

	componentDidMount() {
		window.addEventListener("dragover", this._ignore);
		window.addEventListener("dragenter", this._ignore);
		window.addEventListener("drop", this._ignore);
	}

	componentWillUnmount() {
		this.$timeouts.forEach((it) => clearTimeout(it));
		window.removeEventListener("dragover", this._ignore);
		window.removeEventListener("dragenter", this._ignore);
		window.removeEventListener("drop", this._ignore);
		document.querySelector("body").className = "";
	}

	_ignore = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};
}

export default LevelScreen;
