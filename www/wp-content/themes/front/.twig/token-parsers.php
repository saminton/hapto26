<?php

namespace Twig\TokenParser;

use Twig\Node\IncludeNode;
use Twig\Node\Node;
use Twig\Token;

// https://stackoverflow.com/questions/26170727/how-to-create-a-twig-custom-tag-that-executes-a-callback
// https://medium.com/@pawel.mikolajczuk/create-custom-twig-node-and-parser-b9cc056102ee
// https://twig.symfony.com/doc/3.x/advanced.html#tags

class DefaultTokenParser extends \Twig\TokenParser\AbstractTokenParser {
	public function parse(\Twig\Token $token) {
		$parser = $this->parser;
		$stream = $parser->getStream();

		$var = $parser->getExpressionParser()->parseExpression();

		$name = $var->getAttribute('name');
		$new_value = $var;

		$stream->expect(\Twig\Token::OPERATOR_TYPE, '=');
		$base_value = $parser->getExpressionParser()->parseExpression();

		$stream->expect(\Twig\Token::BLOCK_END_TYPE);

		return new DefaultNode(
			$name,
			$new_value,
			$base_value,
			$token->getLine(),
			$this->getTag()
		);
	}

	public function getTag(): string {
		return 'def';
	}
}

class DefaultNode extends \Twig\Node\Node {
	public function __construct(
		$name,
		\Twig\Node\Expression\AbstractExpression $new_value,
		\Twig\Node\Expression\AbstractExpression $base_value,
		$line,
		$tag = null
	) {
		parent::__construct(
			['new_value' => $new_value, 'base_value' => $base_value],
			['name' => $name],
			$line,
			$tag
		);
	}

	public function compile(\Twig\Compiler $compiler) {
		$name = $this->getAttribute('name');
		$new_value = $this->getNode('new_value');
		$base_value = $this->getNode('base_value');

		// If base value is array and new value is false, use base value
		// Otherwise if new value exists use new value

		$compiler
			->addDebugInfo($this)
			->write('$context[\'' . $name . '\'] = ')
			->write('is_array(')
			->subcompile($base_value)
			->write(') && ')
			->subcompile($new_value)
			->write('== false ? ')
			->subcompile($base_value)
			->write(' : ')
			->subcompile($new_value)
			->write('??')
			->subcompile($base_value)
			->raw(";\n");
	}
}

// Override default Include token parser (always add 'only')

class IncludeTokenParser extends AbstractTokenParser {
	public function parse(Token $token): Node {
		$expr = $this->parser->getExpressionParser()->parseExpression();

		list($variables, $only, $ignoreMissing) = $this->parseArguments();

		return new IncludeNode(
			$expr,
			$variables,
			$only,
			$ignoreMissing,
			$token->getLine(),
			$this->getTag()
		);
	}

	protected function parseArguments() {
		$stream = $this->parser->getStream();

		$ignoreMissing = getenv('APP_ENV') == 'prod';
		if ($stream->nextIf(/* Token::NAME_TYPE */ 5, 'ignore')) {
			$stream->expect(/* Token::NAME_TYPE */ 5, 'missing');

			$ignoreMissing = true;
		}

		$variables = null;
		if ($stream->nextIf(/* Token::NAME_TYPE */ 5, 'with')) {
			$variables = $this->parser->getExpressionParser()->parseExpression();
		}

		$only = true;
		if ($stream->nextIf(/* Token::NAME_TYPE */ 5, 'only')) {
			$only = true;
		}

		$stream->expect(/* Token::BLOCK_END_TYPE */ 3);

		return [$variables, $only, $ignoreMissing];
	}

	public function getTag(): string {
		return 'include';
	}
}
