import React, { Component } from "react";
import classNames from "classnames";
import { getActiveScreenSize } from "../screen";
import styles from "./TVNoise.module.css";

export default class TVNoise extends Component {
	static get id() {
		return "TVNoise";
	}

	render() {
		const { className } = this.props;

		return (
			<canvas
				className={classNames(styles.container, className)}
				width={getActiveScreenSize().width}
				height={getActiveScreenSize().height}
				ref={(canvas) => {
					if (canvas) this._initCanvas(canvas);
				}}
			/>
		);
	}

	componentWillUnmount() {
		cancelAnimationFrame(this._frameId);
	}

	_initCanvas(canvas) {
		cancelAnimationFrame(this._frameId);

		const self = this;
		const context = canvas.getContext("2d");

		const w = context.canvas.width,
			h = context.canvas.height,
			idata = context.createImageData(w, h),
			buffer32 = new Uint32Array(idata.data.buffer);

		function noise(ctx) {
			for (let i = 0; i < buffer32.length; i++)
				buffer32[i] = ((255 * Math.random()) | 0) << 24;

			ctx.putImageData(idata, 0, 0);
		}

		let toggle = true;
		(function loop() {
			toggle = !toggle;
			if (toggle) {
				self._frameId = requestAnimationFrame(loop);
				return;
			}
			noise(context);
			self._frameId = requestAnimationFrame(loop);
		})();
	}
}
