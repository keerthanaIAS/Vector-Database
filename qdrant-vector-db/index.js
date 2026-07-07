#!/usr/bin/env node

import chalk from 'chalk';
import readline from 'readline';

async function showMenu() {
  console.log(chalk.cyan('\n' + '='.repeat(60)));
  console.log(chalk.cyan('🚀 QDRANT VECTOR DATABASE'));
  console.log(chalk.cyan('='.repeat(60)));
  console.log(chalk.gray('\nAvailable commands:\n'));
  console.log(chalk.white('  create     ') + 'Create a new collection');
  console.log(chalk.white('  insert     ') + 'Insert vectors into collection');
  console.log(chalk.white('  search     ') + 'Search for similar vectors');
  console.log(chalk.white('  filter     ') + 'Search with metadata filters');
  console.log(chalk.white('  update     ') + 'Update a vector or payload');
  console.log(chalk.white('  delete     ') + 'Delete a vector by ID');
  console.log(chalk.white('  list       ') + 'List all collections');
  console.log(chalk.white('  info       ') + 'Get detailed collection info');
  console.log(chalk.white('  perf       ') + 'Run performance tests');
  console.log(chalk.white('  drop       ') + 'Drop a collection');
  console.log(chalk.white('  test       ') + 'Test connection to Qdrant');
  console.log(chalk.white('  help       ') + 'Show this menu');
  console.log(chalk.white('  exit       ') + 'Exit');
  console.log(chalk.gray('\n' + '='.repeat(60) + '\n'));
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    await showMenu();
    console.log(chalk.yellow('Usage: node index.js <command> [options]'));
    console.log(chalk.gray('Example: node index.js create'));
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'create':
      await import('./scripts/createCollection.js');
      break;
    case 'insert':
      const count = parseInt(args[1]) || 100;
      process.argv[2] = count;
      await import('./scripts/insertVectors.js');
      break;
    case 'search':
      const limit = parseInt(args[1]) || 10;
      process.argv[2] = limit;
      await import('./scripts/search.js');
      break;
    case 'filter':
      await import('./scripts/filteredSearch.js');
      break;
    case 'update':
      await import('./scripts/updateVector.js');
      break;
    case 'delete':
      process.argv[2] = args[1];
      await import('./scripts/deleteVector.js');
      break;
    case 'list':
      await import('./scripts/listCollections.js');
      break;
    case 'info':
      process.argv[2] = args[1];
      await import('./scripts/collectionInfo.js');
      break;
    case 'perf':
      await import('./scripts/performanceTest.js');
      break;
    case 'drop':
      process.argv[2] = args[1];
      process.argv[3] = args[2];
      await import('./scripts/dropCollection.js');
      break;
    case 'test':
      await import('./scripts/testConnection.js');
      break;
    case 'help':
    default:
      await showMenu();
      break;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { showMenu };