/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from 'vs/nls';
import { Codicon } from 'vs/base/common/codicons';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
import { registerIcon } from 'vs/platform/theme/common/iconRegistry';


const setupIcon = registerIcon('getting-started-setup', Codicon.zap, localize('getting-started-setup-icon', "Icon used for the setup category of getting started"));
const beginnerIcon = registerIcon('getting-started-beginner', Codicon.lightbulb, localize('getting-started-beginner-icon', "Icon used for the beginner category of getting started"));
const codespacesIcon = registerIcon('getting-started-codespaces', Codicon.github, localize('getting-started-codespaces-icon', "Icon used for the codespaces category of getting started"));


export type BuiltinGettingStartedItem = {
	id: string
	title: string,
	description: string,
	button:
	| { title: string, command?: never, link: string }
	| { title: string, command: string, link?: never },
	doneOn: { commandExecuted: string, eventFired?: never } | { eventFired: string, commandExecuted?: never, }
	when?: string,
	media: { type: 'image', path: string | { hc: string, light: string, dark: string }, altText: string },
};

export type BuiltinGettingStartedCategory = {
	id: string
	title: string,
	description: string,
	icon: ThemeIcon,
	when?: string,
	content:
	| { type: 'items', items: BuiltinGettingStartedItem[] }
	| { type: 'startEntry', command: string }
};

type GettingStartedContent = BuiltinGettingStartedCategory[];

export const content: GettingStartedContent = [
	{
		id: 'topLevelNewFile',
		title: localize('gettingStarted.newFile.title', "New File"),
		description: localize('gettingStarted.newFile.description', "Start with a new empty file"),
		icon: Codicon.newFile,
		content: {
			type: 'startEntry',
			command: 'explorer.newFile',
		}
	},
	{
		id: 'topLevelOpenMac',
		title: localize('gettingStarted.openMac.title', "Open..."),
		description: localize('gettingStarted.openMac.description', "Open a file or folder to start working"),
		icon: Codicon.folderOpened,
		when: 'isMac',
		content: {
			type: 'startEntry',
			command: 'workbench.action.files.openFileFolder',
		}
	},
	{
		id: 'topLevelOpenFile',
		title: localize('gettingStarted.openFile.title', "Open File..."),
		description: localize('gettingStarted.openFile.description', "Open a file to start working"),
		icon: Codicon.goToFile,
		when: '!isMac',
		content: {
			type: 'startEntry',
			command: 'workbench.action.files.openFile',
		}
	},
	{
		id: 'topLevelOpenFolder',
		title: localize('gettingStarted.openFolder.title', "Open Folder..."),
		description: localize('gettingStarted.openFolder.description', "Open a folder to start working"),
		icon: Codicon.folderOpened,
		when: '!isMac',
		content: {
			type: 'startEntry',
			command: 'workbench.action.files.openFolder',
		}
	},
	{
		id: 'topLevelCloneRepo',
		title: localize('gettingStarted.cloneRepo.title', "Clone Git Repository..."),
		description: localize('gettingStarted.cloneRepo.description', "Clone a git repository"),
		icon: Codicon.repoClone,
		content: {
			type: 'startEntry',
			command: 'git.clone',
		}
	},
	{
		id: 'topLevelCommandPalette',
		title: localize('gettingStarted.topLevelCommandPalette.title', "Run a Command..."),
		description: localize('gettingStarted.topLevelCommandPalette.description', "Use the command palette to view and run all of vscode's commands"),
		icon: Codicon.symbolColor,
		content: {
			type: 'startEntry',
			command: 'workbench.action.showCommands',
		}
	},
	{
		id: 'Codespaces',
		title: localize('gettingStarted.codespaces.title', "Primer on Codespaces"),
		icon: codespacesIcon,
		when: 'remoteName == codespaces',
		description: localize('gettingStarted.codespaces.description', "Get up and running with your instant code environment."),
		content: {
			type: 'items',
			items: [
				{
					id: 'runProjectTask',
					title: localize('gettingStarted.runProject.title', "Build & run your app"),
					description: localize('gettingStarted.runProject.description', "Build, run & debug your code in the cloud, right from the browser."),
					button: {
						title: localize('gettingStarted.runProject.button', "Start Debugging (F5)"),
						command: 'workbench.action.debug.selectandstart'
					},
					doneOn: { commandExecuted: 'workbench.action.debug.selectandstart' },
					media: { type: 'image', altText: 'Node.js project running debug mode and paused.', path: 'runProject.png' },
				},
				{
					id: 'forwardPortsTask',
					title: localize('gettingStarted.forwardPorts.title', "Access your running application"),
					description: localize('gettingStarted.forwardPorts.description', "Ports running within your codespace are automatically forwarded to the web, so you can open them in your browser."),
					button: {
						title: localize('gettingStarted.forwardPorts.button', "Show Ports Panel"),
						command: '~remote.forwardedPorts.focus'
					},
					doneOn: { commandExecuted: '~remote.forwardedPorts.focus' },
					media: { type: 'image', altText: 'Ports panel.', path: 'forwardPorts.png' },
				},
				{
					id: 'pullRequests',
					title: localize('gettingStarted.pullRequests.title', "Pull requests at your fingertips"),
					description: localize('gettingStarted.pullRequests.description', "Bring your GitHub workflow closer to your code, so you can review pull requests, add comments, merge branches, and more."),
					button: {
						title: localize('gettingStarted.pullRequests.button', "Open GitHub View"),
						command: 'workbench.view.extension.github-pull-requests'
					},
					doneOn: { commandExecuted: 'workbench.view.extension.github-pull-requests' },
					media: { type: 'image', altText: 'Preview for reviewing a pull request.', path: 'pullRequests.png' },
				},
				{
					id: 'remoteTerminal',
					title: localize('gettingStarted.remoteTerminal.title', "Run tasks in the integrated terminal"),
					description: localize('gettingStarted.remoteTerminal.description', "Perform quick command-line tasks using the built-in terminal."),
					button: {
						title: localize('gettingStarted.remoteTerminal.button', "Focus Terminal"),
						command: 'terminal.focus'
					},
					doneOn: { commandExecuted: 'terminal.focus' },
					media: { type: 'image', altText: 'Remote terminal showing npm commands.', path: 'remoteTerminal.png' },
				},
				{
					id: 'openVSC',
					title: localize('gettingStarted.openVSC.title', "Develop remotely in VS Code"),
					description: localize('gettingStarted.openVSC.description', "Access the power of your cloud development environment from your local VS Code. Set it up by installing the GitHub Codespaces extension and connecting your GitHub account."),
					button: {
						title: localize('gettingStarted.openVSC.button', "Open in VS Code"),
						command: 'github.codespaces.openInStable'
					},
					when: 'isWeb',
					doneOn: { commandExecuted: 'github.codespaces.openInStable' },
					media: {
						type: 'image', altText: 'Preview of the Open in VS Code command.', path: {
							dark: 'dark/openVSC.png',
							light: 'light/openVSC.png',
							hc: 'light/openVSC.png',
						}
					},
				}
			]
		}
	},

	{
		id: 'Setup',
		title: localize('gettingStarted.setup.title', "Quick Setup"),
		description: localize('gettingStarted.setup.description', "Extend and customize VS Code to make it yours."),
		icon: setupIcon,
		when: 'remoteName != codespaces',
		content: {
			type: 'items',
			items: [
				{
					id: 'pickColorTheme',
					title: localize('gettingStarted.pickColor.title', "Customize the look with themes"),
					description: localize('gettingStarted.pickColor.description', "Pick a color theme to match your taste and mood while coding."),
					button: { title: localize('gettingStarted.pickColor.button', "Pick a Theme"), command: 'workbench.action.selectTheme' },
					doneOn: { eventFired: 'themeSelected' },
					media: { type: 'image', altText: 'Color theme preview for dark and light theme.', path: 'colorTheme.png', }
				},
				{
					id: 'findLanguageExtensions',
					title: localize('gettingStarted.findLanguageExts.title', "Code in any language"),
					description: localize('gettingStarted.findLanguageExts.description', "VS Code supports over 50+ programming languages. While many are built-in, others can be easily installed as extensions in one click."),
					button: {
						title: localize('gettingStarted.findLanguageExts.button', "Browse Language Extensions"),
						command: 'workbench.extensions.action.showLanguageExtensions',
					},
					doneOn: { commandExecuted: 'workbench.extensions.action.showLanguageExtensions' },
					media: {
						type: 'image', altText: 'Language extensions', path: {
							dark: 'dark/languageExtensions.png',
							light: 'light/languageExtensions.png',
							hc: 'hc/languageExtensions.png',
						}
					}
				},
				{
					id: 'keymaps',
					title: localize('gettingStarted.keymaps.title', "Migrate your keyboard shortcuts"),
					description: localize('gettingStarted.keymaps.description', "Keymap extensions bring your favorite keyboard shortcuts from other editors to VS Code."),
					button: {
						title: localize('gettingStarted.keymaps.button', "Keymap Extensions"),
						command: 'workbench.extensions.action.showRecommendedKeymapExtensions',
					},
					doneOn: { commandExecuted: 'workbench.extensions.action.showRecommendedKeymapExtensions' },
					media: {
						type: 'image', altText: 'List of keymap extensions.', path: {
							dark: 'dark/keymaps.png',
							light: 'light/keymaps.png',
							hc: 'hc/keymaps.png',
						},
					}
				},
				{
					id: 'settingsSync',
					title: localize('gettingStarted.settingsSync.title', "Sync your favorite setup"),
					description: localize('gettingStarted.settingsSync.description', "Never lose the perfect VS Code setup! Settings Sync will back up and share settings, keybindings & extensions across several VS Code instances."),
					when: 'syncStatus != uninitialized',
					button: {
						title: localize('gettingStarted.settingsSync.button', "Enable Settings Sync"),
						command: 'workbench.userDataSync.actions.turnOn',
					},
					doneOn: { eventFired: 'sync-enabled' },
					media: {
						type: 'image', altText: 'The "Turn on Sync" entry in the settings gear menu.', path: {
							dark: 'dark/settingsSync.png',
							light: 'light/settingsSync.png',
							hc: 'light/settingsSync.png',
						},
					}
				},
				{
					id: 'pickAFolderTask-Mac',
					title: localize('gettingStarted.setup.OpenFolder.title', "Open your project"),
					description: localize('gettingStarted.setup.OpenFolder.description', "Open a project folder to get started!"),
					when: 'isMac',
					button: {
						title: localize('gettingStarted.setup.OpenFolder.button', "Pick a Folder"),
						command: 'workbench.action.files.openFileFolder'
					},
					doneOn: { commandExecuted: 'workbench.action.files.openFileFolder' },
					media: {
						type: 'image', altText: 'Explorer view showing buttons for opening folder and cloning repository.', path: {
							dark: 'dark/openFolder.png',
							light: 'light/openFolder.png',
							hc: 'hc/openFolder.png',
						}
					}
				},
				{
					id: 'pickAFolderTask-Other',
					title: localize('gettingStarted.setup.OpenFolder.title', "Open your project"),
					description: localize('gettingStarted.setup.OpenFolder.description2', "Open a folder to get started!"),
					when: '!isMac',
					button: {
						title: localize('gettingStarted.setup.OpenFolder.button', "Pick a Folder"),
						command: 'workbench.action.files.openFolder'
					},
					doneOn: { commandExecuted: 'workbench.action.files.openFolder' },
					media: {
						type: 'image', altText: 'Explorer view showing buttons for opening folder and cloning repository.', path: {
							dark: 'dark/openFolder.png',
							light: 'light/openFolder.png',
							hc: 'hc/openFolder.png',
						}
					}
				}
			]
		}
	},

	{
		id: 'Beginner',
		title: localize('gettingStarted.beginner.title', "Learn the Fundamentals"),
		icon: beginnerIcon,
		description: localize('gettingStarted.beginner.description', "Jump right into VS Code and get an overview of the must-have features."),
		content: {
			type: 'items',
			items: [
				{
					id: 'commandPaletteTask',
					title: localize('gettingStarted.commandPalette.title', "Find & run commands"),
					description: localize('gettingStarted.commandPalette.description', "The easiest way to find everything VS Code can do. If you're ever looking for a feature or a shortcut, check here first!"),
					button: {
						title: localize('gettingStarted.commandPalette.button', "Open Command Palette"),
						command: 'workbench.action.showCommands'
					},
					doneOn: { commandExecuted: 'workbench.action.showCommands' },
					media: {
						type: 'image', altText: 'Command Palette overlay for searching and executing commands.', path: {
							dark: 'dark/commandPalette.png',
							light: 'light/commandPalette.png',
							hc: 'light/commandPalette.png',
						}
					},
				},
				{
					id: 'terminal',
					title: localize('gettingStarted.terminal.title', "Convenient built-in terminal"),
					description: localize('gettingStarted.terminal.description', "Quickly run shell commands and monitor build output, right next to your code."),
					when: 'remoteName != codespaces',
					button: {
						title: localize('gettingStarted.terminal.button', "Show Terminal Panel"),
						command: 'workbench.action.terminal.toggleTerminal'
					},
					doneOn: { commandExecuted: 'workbench.action.terminal.toggleTerminal' },
					media: {
						type: 'image', altText: 'Integrated terminal running a few npm commands', path: {
							dark: 'dark/terminal.png',
							light: 'light/terminal.png',
							hc: 'light/terminal.png',
						}
					},
				},
				{
					id: 'extensions',
					title: localize('gettingStarted.extensions.title', "Limitless extensibility"),
					description: localize('gettingStarted.extensions.description', "Extensions are VS Code's power-ups. They range from handy productivity hacks, expanding out-of-the-box features, to adding completely new capabilities."),
					button: {
						title: localize('gettingStarted.extensions.button', "Browse Recommended Extensions"),
						command: 'workbench.extensions.action.showRecommendedExtensions'
					},
					doneOn: { commandExecuted: 'workbench.extensions.action.showRecommendedExtensions' },
					media: {
						type: 'image', altText: 'VS Code extension marketplace with featured language extensions', path: {
							dark: 'dark/extensions.png',
							light: 'light/extensions.png',
							hc: 'light/extensions.png',
						}
					},
				},
				{
					id: 'settings',
					title: localize('gettingStarted.settings.title', "Everything is a setting"),
					description: localize('gettingStarted.settings.description', "Optimize every part of VS Code's look & feel to your liking. Enabling Settings Sync lets you share your personal tweaks across machines."),
					button: {
						title: localize('gettingStarted.settings.button', "Tweak my Settings"),
						command: 'workbench.action.openSettings'
					},
					doneOn: { commandExecuted: 'workbench.action.openSettings' },
					media: {
						type: 'image', altText: 'VS Code Settings', path: {
							dark: 'dark/settings.png',
							light: 'light/settings.png',
							hc: 'hc/settings.png',
						}
					},
				},
				{
					id: 'videoTutorial',
					title: localize('gettingStarted.videoTutorial.title', "Lean back and learn"),
					description: localize('gettingStarted.videoTutorial.description', "Watch the first in a series of short & practical video tutorials for VS Code's key features."),
					button: {
						title: localize('gettingStarted.videoTutorial.button', "Watch Tutorial"),
						link: 'https://aka.ms/vscode-getting-started-video'
					},
					doneOn: { eventFired: 'linkOpened:https://aka.ms/vscode-getting-started-video' },
					media: { type: 'image', altText: 'VS Code Settings', path: 'tutorialVideo.png' },
				}
			]
		}
	}
];
