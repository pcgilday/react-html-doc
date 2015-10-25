import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom/server';


class HTMLDocument extends Component {

  renderChildren() {
    if ( !this.props.children ) return null;
    const { shouldRenderChildrenStatically, children, childrenContainerId } = this.props;
    const markup = shouldRenderChildrenStatically ?
      ReactDOM.renderToStaticMarkup(children) :
      ReactDOM.renderToString(children);
    const childrenHTML = { __html: markup };
    return (
      <div key={childrenContainerId} id={childrenContainerId} dangerouslySetInnerHTML={childrenHTML} />
    );
  }

  renderMetatags() {
    const { metatags } = this.props;
    return metatags.map((props, index) => {
      return <meta key={index} {...props} />;
    });
  }

  renderLinkedStylesheet(href) {
    return (
      <link key={href} rel="stylesheet" href={href} />
    );
  }

  renderInlineStyle(css) {
    const cssHTML = { __html: css };
    return (
      <style key={css} dangerouslySetInnerHTML={cssHTML} />
    );
  }

  renderSourcedScript(src) {
    return (
      <script key={src} src={src} />
    );
  }

  renderInlineScript(js) {
    const scriptHTML = { __html: js };
    return (
      <script key={js} dangerouslySetInnerHTML={scriptHTML} />
    );
  }

  renderStylesheets() {
    const { stylesheets } = this.props;
    return stylesheets.map(props => {
      const linkProps = typeof props === 'string' ? { href: props } : props;
      const renderedTag = linkProps.inline ?
        this.renderInlineStyle(linkProps.inline) :
        this.renderLinkedStylesheet(linkProps.href);
      return renderedTag;
    });
  }

  renderStateScript() {
    const { state, stateKey } = this.props;
    const serverState = `window.${stateKey} = ${JSON.stringify(state)};`;
    const scriptHTML = { __html: serverState };
    const stateScriptProps = {
      [`data-${stateKey}`]: true,
      key: 'state',
      dangerouslySetInnerHTML: scriptHTML
    };
    return (
      <script {...stateScriptProps} />
    );
  }

  renderUserScripts() {
    const { scripts } = this.props;
    return scripts.map(props => {
      const scriptProps = typeof props === 'string' ? { src: props } : props;
      const renderedTag = scriptProps.inline ?
        this.renderInlineScript(scriptProps.inline) :
        this.renderSourcedScript(scriptProps.src);
      return renderedTag;
    });
  }

  renderScripts() {
    const stateScript = this.renderStateScript();
    const userScripts = this.renderUserScripts();
    return [stateScript].concat(userScripts);
  }

  render() {
    return (
      <html>
        <head>
          <title>{this.props.title}</title>
          {this.renderMetatags()}
          {this.renderStylesheets()}
        </head>
        <body>
          {this.renderChildren()}
          {this.renderScripts()}
        </body>
      </html>
    );
  }
}

HTMLDocument.propTypes = {
  childrenContainerId: PropTypes.string,
  children: PropTypes.node,
  metatags: PropTypes.array,
  scripts: PropTypes.array,
  shouldRenderChildrenStatically: PropTypes.bool,
  state: PropTypes.object,
  stateKey: PropTypes.string,
  stylesheets: PropTypes.array,
  title: PropTypes.string,
};

HTMLDocument.defaultProps = {
  childrenContainerId: 'app',
  metatags: [],
  scripts: [],
  shouldRenderChildrenStatically: false,
  state: { },
  stateKey: '__state',
  stylesheets: [],
  title: ''
};


export default HTMLDocument;