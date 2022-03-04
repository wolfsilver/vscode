/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { deepStrictEqual, ok, strictEqual } from 'assert';
import { ITerminalProcessOptions } from 'vs/platform/terminal/common/terminal';
import { getShellIntegrationInjection, IShellIntegrationConfigInjection } from 'vs/platform/terminal/node/terminalEnvironment';

const enabledProcessOptions: ITerminalProcessOptions['shellIntegration'] = { enabled: true, showWelcome: true };
const disabledProcessOptions: ITerminalProcessOptions['shellIntegration'] = { enabled: false, showWelcome: true };
const pwshExe = process.platform === 'win32' ? 'pwsh.exe' : 'pwsh';
const repoRoot = process.platform === 'win32' ? process.cwd()[0].toLowerCase() + process.cwd().substring(1) : process.cwd();

suite('platform - terminalEnvironment', () => {
	suite('getShellIntegrationInjection', () => {
		suite('should not enable', () => {
			test('when isFeatureTerminal or when no executable is provided', () => {
				ok(!getShellIntegrationInjection({ executable: pwshExe, args: ['-l', '-NoLogo'], isFeatureTerminal: true }, enabledProcessOptions));
				ok(getShellIntegrationInjection({ executable: pwshExe, args: ['-l', '-NoLogo'], isFeatureTerminal: false }, enabledProcessOptions));
			});
		});

		suite('pwsh', () => {
			const expectedPs1 = process.platform === 'win32'
				? `${repoRoot}\\out\\vs\\workbench\\contrib\\terminal\\browser\\media\\shellIntegration.ps1`
				: `${repoRoot}/out/vs/workbench/contrib/terminal/browser/media/shellIntegration.ps1`;
			suite('should override args', () => {
				const enabledExpectedResult: IShellIntegrationConfigInjection = Object.freeze({
					newArgs: [
						'-noexit',
						'-command',
						`. "${expectedPs1}"`
					]
				});
				test('when undefined, []', () => {
					deepStrictEqual(getShellIntegrationInjection({ executable: pwshExe, args: [] }, enabledProcessOptions), enabledExpectedResult);
					deepStrictEqual(getShellIntegrationInjection({ executable: pwshExe, args: undefined }, enabledProcessOptions), enabledExpectedResult);
				});
				suite('when no logo', () => {
					test('array - case insensitive', () => {
						deepStrictEqual(getShellIntegrationInjection({ executable: pwshExe, args: ['-NoLogo'] }, enabledProcessOptions), enabledExpectedResult);
						deepStrictEqual(getShellIntegrationInjection({ executable: pwshExe, args: ['-NOLOGO'] }, enabledProcessOptions), enabledExpectedResult);
						deepStrictEqual(getShellIntegrationInjection({ executable: pwshExe, args: ['-nol'] }, enabledProcessOptions), enabledExpectedResult);
						deepStrictEqual(getShellIntegrationInjection({ executable: pwshExe, args: ['-NOL'] }, enabledProcessOptions), enabledExpectedResult);
					});
					test('string - case insensitive', () => {
						deepStrictEqual(getShellIntegrationInjection({ executable: pwshExe, args: '-NoLogo' }, enabledProcessOptions), enabledExpectedResult);
						deepStrictEqual(getShellIntegrationInjection({ executable: pwshExe, args: '-NOLOGO' }, enabledProcessOptions), enabledExpectedResult);
						deepStrictEqual(getShellIntegrationInjection({ executable: pwshExe, args: '-nol' }, enabledProcessOptions), enabledExpectedResult);
						deepStrictEqual(getShellIntegrationInjection({ executable: pwshExe, args: '-NOL' }, enabledProcessOptions), enabledExpectedResult);
					});
				});
			});
			suite('should incorporate login arg', () => {
				const enabledExpectedResult: IShellIntegrationConfigInjection = Object.freeze({
					newArgs: [
						'-l',
						'-noexit',
						'-command',
						`. "${expectedPs1}"`
					]
				});
				test('when array contains no logo and login', () => {
					deepStrictEqual(getShellIntegrationInjection({ executable: pwshExe, args: ['-l', '-NoLogo'] }, enabledProcessOptions), enabledExpectedResult);
				});
				test('when string', () => {
					deepStrictEqual(getShellIntegrationInjection({ executable: pwshExe, args: '-l' }, enabledProcessOptions), enabledExpectedResult);
				});
			});
			suite('should not modify args', () => {
				test('when shell integration is disabled', () => {
					strictEqual(getShellIntegrationInjection({ executable: pwshExe, args: ['-l'] }, disabledProcessOptions), undefined);
					strictEqual(getShellIntegrationInjection({ executable: pwshExe, args: '-l' }, disabledProcessOptions), undefined);
					strictEqual(getShellIntegrationInjection({ executable: pwshExe, args: undefined }, disabledProcessOptions), undefined);
				});
				test('when using unrecognized arg', () => {
					strictEqual(getShellIntegrationInjection({ executable: pwshExe, args: ['-l', '-NoLogo', '-i'] }, disabledProcessOptions), undefined);
				});
				test('when using unrecognized arg (string)', () => {
					strictEqual(getShellIntegrationInjection({ executable: pwshExe, args: '-i' }, disabledProcessOptions), undefined);
				});
			});
		});

		if (process.platform !== 'win32') {
			suite('zsh', () => {
				suite('should override args', () => {
					const expectedDir = /.+\/vscode-zsh/;
					const expectedDest = /.+\/vscode-zsh\/.zshrc/;
					const expectedSource = /.+\/out\/vs\/workbench\/contrib\/terminal\/browser\/media\/shellIntegration.zsh/;
					function assertIsEnabled(result: IShellIntegrationConfigInjection) {
						strictEqual(Object.keys(result.envMixin!).length, 1);
						ok(result.envMixin!['ZDOTDIR']?.match(expectedDir));
						strictEqual(result.filesToCopy?.length, 1);
						ok(result.filesToCopy[0].dest.match(expectedDest));
						ok(result.filesToCopy[0].source.match(expectedSource));
					}
					test('when undefined, []', () => {
						const result1 = getShellIntegrationInjection({ executable: 'zsh', args: [] }, enabledProcessOptions);
						deepStrictEqual(result1?.newArgs, ['-i']);
						assertIsEnabled(result1);
						const result2 = getShellIntegrationInjection({ executable: 'zsh', args: undefined }, enabledProcessOptions);
						deepStrictEqual(result2?.newArgs, ['-i']);
						assertIsEnabled(result2);
					});
					suite('should incorporate login arg', () => {
						test('when array', () => {
							const result = getShellIntegrationInjection({ executable: 'zsh', args: ['-l'] }, enabledProcessOptions);
							deepStrictEqual(result?.newArgs, ['-il']);
							assertIsEnabled(result);
						});
					});
					suite('should not modify args', () => {
						test('when shell integration is disabled', () => {
							strictEqual(getShellIntegrationInjection({ executable: 'zsh', args: ['-l'] }, disabledProcessOptions), undefined);
							strictEqual(getShellIntegrationInjection({ executable: 'zsh', args: undefined }, disabledProcessOptions), undefined);
						});
						test('when using unrecognized arg', () => {
							strictEqual(getShellIntegrationInjection({ executable: 'zsh', args: ['-l', '-fake'] }, disabledProcessOptions), undefined);
						});
					});
				});
			});
			suite('bash', () => {
				suite('should override args', () => {
					test('when undefined, [], empty string', () => {
						const enabledExpectedResult: IShellIntegrationConfigInjection = Object.freeze({
							newArgs: [
								'--init-file',
								`${repoRoot}/out/vs/workbench/contrib/terminal/browser/media/shellIntegration-bash.sh`
							],
							envMixin: {}
						});
						deepStrictEqual(getShellIntegrationInjection({ executable: 'bash', args: [] }, enabledProcessOptions), enabledExpectedResult);
						deepStrictEqual(getShellIntegrationInjection({ executable: 'bash', args: '' }, enabledProcessOptions), enabledExpectedResult);
						deepStrictEqual(getShellIntegrationInjection({ executable: 'bash', args: undefined }, enabledProcessOptions), enabledExpectedResult);
					});
					suite('should set login env variable and not modify args', () => {
						const enabledExpectedResult = Object.freeze({
							newArgs: [
								'--init-file',
								`${repoRoot}/out/vs/workbench/contrib/terminal/browser/media/shellIntegration-bash.sh`
							],
							envMixin: {
								VSCODE_SHELL_LOGIN: '1'
							}
						} as IShellIntegrationConfigInjection);
						test('when array', () => {
							deepStrictEqual(getShellIntegrationInjection({ executable: 'bash', args: ['-l'] }, enabledProcessOptions), enabledExpectedResult);
						});
					});
					suite('should not modify args', () => {
						test('when shell integration is disabled', () => {
							strictEqual(getShellIntegrationInjection({ executable: 'bash', args: ['-l'] }, disabledProcessOptions), undefined);
							strictEqual(getShellIntegrationInjection({ executable: 'bash', args: undefined }, disabledProcessOptions), undefined);
						});
						test('when custom array entry', () => {
							strictEqual(getShellIntegrationInjection({ executable: 'bash', args: ['-l', '-i'] }, disabledProcessOptions), undefined);
						});
					});
				});
			});
		}
	});
});
