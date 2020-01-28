import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid/v4';

const renderers = [];

const injectScript = (locale, sitekeyV3) => {
  window.GoogleRecaptchaLoaded = () => {
    while ( renderers.length ) {
      const renderer = renderers.shift();
      renderer();
    }
  };

  const srcRenderValue = sitekeyV3 || 'explicit';
  const script = document.createElement( 'script' );
  script.id = 'recaptcha';
  script.src = `https://www.google.com/recaptcha/api.js?hl=${locale}&onload=GoogleRecaptchaLoaded&render=${srcRenderValue}`;
  script.type = 'text/javascript';
  script.async = true;
  script.defer = true;
  script.onerror = function( error ) { throw error; };
  document.body.appendChild( script );
};

class GoogleRecaptcha extends React.Component {
  componentDidMount() {
    const { sitekey, locale, badge, onResolved, onLoaded, sitekeyV3, action } = this.props;

    this.callbackName = 'GoogleRecaptchaResolved-' + uuid();
    window[ this.callbackName ] = onResolved;

    const loaded = () => {
      if ( this.container ) {
        const recaptchaId = window.grecaptcha.render( this.container, {
          sitekey,
          size: 'invisible',
          badge,
          callback: this.callbackName
        });
        this.execute = () => window.grecaptcha.execute( recaptchaId );
        this.reset = () => window.grecaptcha.reset( recaptchaId );
        this.getResponse = () => window.grecaptcha.getResponse( recaptchaId );
        if (sitekeyV3) {
          this.executeV3 = () => window.grecaptcha.execute( sitekeyV3, { action } );
        }
        onLoaded();
      }
    };

    if ( window.grecaptcha &&
      window.grecaptcha.render &&
      window.grecaptcha.execute &&
      window.grecaptcha.reset &&
      window.grecaptcha.getResponse
    ) {
      loaded();
    } else {
      renderers.push( loaded );
      injectScript( locale, sitekeyV3 );
    }
  }
  componentWillUnmount() {
    delete window[ this.callbackName ];
    delete this.container;
  }
  render() {
    const { style } = this.props;
    return (
      <div ref={ ref => this.container = ref } style={ style } />
    );
  }
}

GoogleRecaptcha.propTypes = {
  sitekey: PropTypes.string.isRequired,
  sitekeyV3: PropTypes.string,
  action: PropTypes.string,
  locale: PropTypes.string,
  badge: PropTypes.oneOf( [ 'bottomright', 'bottomleft', 'inline' ] ),
  onResolved: PropTypes.func.isRequired,
  onLoaded: PropTypes.func,
  style: PropTypes.object
};

GoogleRecaptcha.defaultProps = {
  locale: 'en',
  badge: 'bottomright',
  onLoaded: () => {},
  sitekeyV3: null,
  action: 'homepage',
};

export default GoogleRecaptcha;
