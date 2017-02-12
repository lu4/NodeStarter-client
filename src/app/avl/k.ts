import { Comparer } from './comparer';

export class AvlNode<K> {
    public height: number = 0;

    public constructor(
        public key: K,
        public left: AvlNode<K> | null = null,
        public right: AvlNode<K> | null = null
    ) {
    }

    /**
     * Performs a right rotate on this node.
     *
     *       b                           a
     *      / \                         / \
     *     a   e -> b.rotateRight() -> c   b
     *    / \                             / \
     *   c   d                           d   e
     *
     * @return { Node } The root of the sub-tree; the node where this node used to be.
     */
    public rotateRight(): AvlNode<K> {
        let prevL = <AvlNode<K>>this.left;
        this.left = prevL.right;

        prevL.right = this;

        let left = this.left;
        let right = this.right;
        let leftHeight = left ? left.height : -1;
        let rightHeight = right ? right.height : -1;

        this.height = Math.max(leftHeight, rightHeight) + 1;
        prevL.height = Math.max(leftHeight, this.height) + 1;

        return prevL;
    };

    /**
     * Performs a left rotate on this node.
     *
     *     a                              b
     *    / \                            / \
     *   c   b   -> a.rotateLeft() ->   a   e
     *      / \                        / \
     *     d   e                      c   d
     *
     * @return { Node } The root of the sub-tree; the node where this node used to be.
     */
    public rotateLeft(): AvlNode<K> {
        let prevRight = <AvlNode<K>>this.right;
        this.right = prevRight.left;
        prevRight.left = this;

        let left = this.left;
        let right = this.right;
        let leftHeight = left ? left.height : -1;
        let rightHeight = right ? right.height : -1;

        this.height = Math.max(leftHeight, rightHeight) + 1;
        prevRight.height = Math.max(rightHeight, this.height) + 1;

        return prevRight;
    };
}

export class Avl<K> {
    private _size: number = 0;
    private _root: AvlNode<K> | null = null;

    /**
     * @return { number } The size of the tree.
     */
    public get size() {
      return this._size;
    };

    /**
     * @return { boolean } Whether the tree is empty.
     */
    public isEmpty() {
      return this._size === 0;
    };

    /**
     * Creates a new AVL Tree.
     *
     * @param {function} _compare An optional custom compare function.
     */
    public constructor(private _compare: Comparer<K>) {

    }

    /**
     * Inserts a new node with a specific key into the tree, when key already exists in the tree it gets replaced.
     *
     * @private
     * @param { Object } key The key being inserted.
     * @param { Object } value The value being inserted.
     * @return { Node } The new tree root.
     */
    public add(key: K): K {
        this._size++;
        this._root = this._add(key, this._root);

        return key;
    }

    /**
     * Lazily inserts a new node with a specific key into the tree.
     *
     * @private
     * @param { Object } key The key being inserted.
     * @param { Node } root The root of the tree to insert in.
     * @param { Object } value The value being inserted.
     * @return { Node } The new tree root.
     */
    private _add(key: K, root: AvlNode<K> | null): AvlNode<K> {
        // Perform regular BST insertion
        if (root === null) {
            return new AvlNode<K>(key, null, null);
        }

        let comparison = this._compare(key, root.key);
        if (comparison < 0) {
            root.left = this._add(key, root.left);
        } else if (comparison > 0) {
            root.right = this._add(key, root.right);
        } else {
            // It's a duplicate so insertion failed, decrement size to make up for it
            this._size--;

            throw new Error(`Key "${ key }" already present in this avl tree`);
        }

        let left = <AvlNode<K>>root.left;
        let right = <AvlNode<K>>root.right;
        let leftHeight = left ? left.height : -1;
        let rightHeight = right ? right.height : -1;

        // Update height and rebalance tree
        root.height = Math.max(leftHeight, rightHeight) + 1;

        /* tslint:disable:no-switch-case-fall-through */
        switch (leftHeight - rightHeight) {
            case 2: // balance = BalanceState.UnbalancedLeft;
                if (this._compare(key, left.key) < 0) {
                    // Left left case
                    return root = root.rotateRight();
                } else {
                    // Left right case
                    root.left = left.rotateLeft();
                    return root.rotateRight();
                }
            case -2: // balance = BalanceState.UnbalancedRight;
                if (this._compare(key, right.key) > 0) {
                    // Right right case
                    return root = root.rotateLeft();
                } else {
                    // Right left case
                    root.right = right.rotateRight();
                    return root.rotateLeft();
                }
        }
        /* tslint:enable:no-switch-case-fall-through */

        return root;
    }

    /**
     * Inserts a new node with a specific key into the tree, when key already exists in the tree it gets replaced.
     *
     * @private
     * @param { Object } key The key being inserted.
     * @param { Object } value The value being inserted.
     * @return { Node } The new tree root.
     */
    public put(key: K): void {
        this._size++;
        this._root = this._put(key, this._root);
    }

    /**
     * Lazily inserts a new node with a specific key into the tree.
     *
     * @private
     * @param { Object } key The key being inserted.
     * @param { Node } root The root of the tree to insert in.
     * @param { Object } value The value being inserted.
     * @return { Node } The new tree root.
     */
    private _put(key: K, root: AvlNode<K> | null): AvlNode<K> {
        // Perform regular BST insertion
        if (root === null) {
            return new AvlNode<K>(key);
        }

        let comparison = this._compare(key, root.key);
        if (comparison < 0) {
            root.left = this._put(key, root.left);
        } else if (comparison > 0) {
            root.right = this._put(key, root.right);
        } else {
            // It's a duplicate so insertion failed, decrement size to make up for it
            this._size--;
            return root;
        }

        let left = <AvlNode<K>>root.left;
        let right = <AvlNode<K>>root.right;
        let leftHeight = left ? left.height : -1;
        let rightHeight = right ? right.height : -1;

        // Update height and rebalance tree
        root.height = Math.max(leftHeight, rightHeight) + 1;

        /* tslint:disable:no-switch-case-fall-through */
        switch (leftHeight - rightHeight) {
            case 2: // balance = BalanceState.UnbalancedLeft;
                if (this._compare(key, left.key) < 0) {
                    // Left left case
                    return root = root.rotateRight();
                } else {
                    // Left right case
                    root.left = left.rotateLeft();
                    return root.rotateRight();
                }
            case -2: // balance = BalanceState.UnbalancedRight;
                if (this._compare(key, right.key) > 0) {
                    // Right right case
                    return root = root.rotateLeft();
                } else {
                    // Right left case
                    root.right = right.rotateRight();
                    return root.rotateLeft();
                }
        }
        /* tslint:enable:no-switch-case-fall-through */

        return root;
    }


    /**
     * Inserts a new node with a specific key into the tree, when key already exists in the tree it gets replaced.
     *
     * @private
     * @param { Object } key The key being inserted.
     * @param { Object } value The value being inserted.
     * @return { Node } The new tree root.
     */
    public set(key: K): K {
        this._size++;
        this._root = this._set(key, this._root);

        return key;
    }

    /**
     * Lazily inserts a new node with a specific key into the tree.
     *
     * @private
     * @param { Object } key The key being inserted.
     * @param { Node } root The root of the tree to insert in.
     * @param { Object } value The value being inserted.
     * @return { Node } The new tree root.
     */
    private _set(key: K, root: AvlNode<K> | null): AvlNode<K> {
        // Perform regular BST insertion
        if (root === null) {
            return new AvlNode<K>(key);
        }

        let comparison = this._compare(key, root.key);
        if (comparison < 0) {
            root.left = this._set(key, root.left);
        } else if (comparison > 0) {
            root.right = this._set(key, root.right);
        } else {
            // It's a duplicate so insertion failed, decrement size to make up for it
            this._size--;

            root.key = key;

            return root;
        }

        // Update height and rebalance tree
        let left = <AvlNode<K>>root.left;
        let right = <AvlNode<K>>root.right;
        let leftHeight = left ? left.height : -1;
        let rightHeight = right ? right.height : -1;

        root.height = Math.max(leftHeight, rightHeight) + 1;

        /* tslint:disable:no-switch-case-fall-through */
        switch (leftHeight - rightHeight) {
            case 2: // balance = BalanceState.UnbalancedLeft;
                if (this._compare(key, left.key) < 0) {
                    // Left left case
                    return root = root.rotateRight();
                } else {
                    // Left right case
                    root.left = left.rotateLeft();
                    return root.rotateRight();
                }
            case -2: // balance = BalanceState.UnbalancedRight;
                if (this._compare(key, right.key) > 0) {
                    // Right right case
                    return root = root.rotateLeft();
                } else {
                    // Right left case
                    root.right = right.rotateRight();
                    return root.rotateLeft();
                }
        }
        /* tslint:enable:no-switch-case-fall-through */

        return root;
    }

    /**
     * Deletes a node with a specific key from the tree.
     *
     * @private
     * @param { Object } key The key being deleted.
     * @return { Node } The new tree root.
     */
    public remove(key: K): void {
        this._root = this._remove(key, this._root);
        this._size--;
    }

    /**
     * Deletes a node with a specific key from the tree.
     *
     * @private
     * @param { Object } key The key being deleted.
     * @param { Node } root The root of the tree to delete from.
     * @return { Node } The new tree root.
     */
    private _remove(key: K, root: AvlNode<K> | null): AvlNode<K> | null {
        // Perform regular BST deletion
        if (root === null) {
            this._size++;
            return root;
        }

        let comparison = this._compare(key, root.key);
        if (comparison < 0) {
            // The key to be deleted is in the left sub-tree
            root.left = this._remove(key, root.left);
        } else if (comparison > 0) {
            // The key to be deleted is in the right sub-tree
            root.right = this._remove(key, root.right);
        } else {
            // root is the node to be deleted
            if (!root.left && !root.right) {
                root = null;
            } else if (!root.left) {
                root = root.right;
            } else if (!root.right) {
                root = root.left;
            } else {
                // Node has 2 children, get the in-order successor
                let successor = this._min(root.right);
                root.key = successor.key;
                root.right = this._remove(successor.key, root.right);
            }
        }

        if (root === null) {
            return root;
        }

        let left = <AvlNode<K>>root.left;
        let right = <AvlNode<K>>root.right;
        let leftHeight = left ? left.height : -1;
        let rightHeight = right ? right.height : -1;

        // Update height and rebalance tree
        root.height = Math.max(leftHeight, rightHeight) + 1;

        switch (leftHeight - rightHeight) {
            case -2: // balance = BalanceState.UnbalancedRight;
                let right_left = right.left;
                let right_right = right.right;

                if (1 === (right_left ? right_left.height : -1) - (right_right ? right_right.height : -1)) {
                    root.right = right.rotateRight();
                }

                return root.rotateLeft();
            case 2: // balance = BalanceState.UnbalancedLeft;
                let left_left = left.left;
                let left_right = left.right;

                if (1 === (left_right ? left_right.height : -1) - (left_left ? left_left.height : -1)) {
                    root.left = left.rotateLeft();
                }

                return root.rotateRight();
        }

        return root;
    }

    /**
     * Gets the value of a node within the tree with a specific key.
     *
     * @param { Object } key The key being searched for.
     * @return { Object } The value of the node or null if it doesn't exist.
     */
    public get(key: K): K | null {
        if (this._root === null) {
            return null;
        }

        let result = this._get(key, this._root);

        return result ? result.key : null;
    }

    /**
     * Gets the value of a node within the tree with a specific key.
     *
     * @private
     * @param { Object } key The key being searched for.
     * @param { Node } root The root of the tree to search in.
     * @return { Object } The value of the node or null if it doesn't exist.
     */
    private _get(key: K, root: AvlNode<K>): AvlNode<K> | null {
      if (key === root.key) {
        return root;
      }

      if (this._compare(key, root.key) < 0) {
        if (!root.left) {
          return null;
        }
        return this._get(key, root.left);
      }

      if (!root.right) {
        return null;
      }
      return this._get(key, root.right);
    };

    /**
     * Gets whether a node with a specific key is within the tree.
     *
     * @param { Object } key The key being searched for.
     * @return { boolean } Whether a node with the key exists.
     */
    public has(key: K) {
        if (this._root === null) {
            return false;
        }

        return !!this._get(key, this._root);
    };

    /**
     * @return { Object } The minimum key in the tree.
     */
    public min(): K | null {
        if (this._root === null) {
            return null;
        }

        let result = this._min(this._root);

        return result && result.key;
    };

    /**
     * Gets the minimum value node, rooted in a particular node.
     *
     * @private
     * @param { Node } root The node to search.
     * @return { Node } The node with the minimum key in the tree.
     */
    private _min(root: AvlNode<K>) {
        let current = root;
        while (current.left) {
            current = current.left;
        }
        return current;
    }

    /**
     * @return { Object } The maximum key in the tree.
     */
    public max(): K | null {
        if (this._root === null) {
            return null;
        }

        let result = this._max(this._root);

        return result && result.key;
    };

    /**
     * Gets the maximum value node, rooted in a particular node.
     *
     * @private
     * @param { Node } root The node to search.
     * @return { Node } The node with the maximum key in the tree.
     */
    private _max(root: AvlNode<K>) {
        let current = root;
        while (current.right) {
            current = current.right;
        }
        return current;
    }

    /**
     * Searches a tuple of 'previous', 'current', 'next' nodes relative to a key. 
     *
     * @param key The key being searched for.
     * @param root The root of the tree to search in.
     * @return Whether a node with the key exists.
     */
    public find(key: K): [K | null, K | null, K | null] {
        return this._find(key, this._root, null, null);
    }

    /**
     * Gets a tuple of 'previous', 'current', 'next' keys relative to a key. 
     *
     * @param key The key being searched for.
     * @param root The root of the tree to search in.
     * @return Whether a node with the key exists.
     */
    private _find(
        key: K,
        root: AvlNode<K> | null,
        prev: AvlNode<K> | null,
        next: AvlNode<K> | null
    ): [K | null, K | null, K | null] {
        if (root !== null) {
            let comparison = this._compare(key, root.key);

            if (comparison < 0) {
                if (root.left === null) {
                    return [prev && prev.key, null, root.key];
                } else {
                    return this._find(key, root.left, prev, root);
                }
            } else if (comparison > 0) {
                if (root.right === null) {
                    return [root.key, null, next && next.key];
                } else {
                    return this._find(key, root.right, root, next);
                }
            } else {
                return [prev && prev.key, root.key, next && next.key];
            }
        } else {
            return [null, null, null];
        }
    }

    public iterateForward<T>(key: K, fn: (value: K, key: K) => T): T | null {
        return this._iterateForward(key, this._root, fn) || null;
    }

    /**
     * Iterates a tree in from min() to max() direction starting from providded key while iterator function returns undefined
     *
     * @param key The key being searched for.
     * @param root The root of the tree to search in.
     * @return Whether a node with the key exists.
     */
    private _iterateForward<T>(key: K, root: AvlNode<K> | null, fn: (value: K, key: K) => T): T | undefined {
        if (root !== null) {
            let result: T | undefined, comparison = this._compare(key, root.key);

            if (comparison < 0) {
                if (root.left === null) {
                    result = fn(root.key, root.key);

                    if (result !== void 0) { return result; }

                    return this._iterateForward<T>(key, root.right, fn);
                } else {
                    result = this._iterateForward<T>(key, root.left, fn);

                    if (result !== void 0) { return result; }

                    result = fn(root.key, root.key);

                    if (result !== void 0) { return result; }

                    return this._iterateForward<T>(key, root.right, fn);
                }
            } else if (comparison > 0) {
                if (root.right === null) {
                    return void 0;
                } else {
                    return this._iterateForward<T>(key, root.right, fn);
                }
            } else {
                return fn(root.key, root.key);
            }
        } else {
            return void 0;
        }
    }

    public iterateReverse<T>(key: K, fn: (value: K, key: K) => T): T | null {
        return this._iterateReverse(key, this._root, fn) || null;
    }

    /**
     * Iterates a tree from max() to min() direction starting from providded key  
     *
     * @param key The key being searched for.
     * @param root The root of the tree to search in.
     * @return Whether a node with the key exists.
     */
    private _iterateReverse<T>(key: K, root: AvlNode<K> | null, fn: (value: K, key: K) => T): T | undefined {
        if (root !== null) {
            let result: T | undefined, comparison = this._compare(key, root.key);

            if (comparison < 0) {
                if (root.left === null) {
                    return void 0;
                } else {
                    return this._iterateReverse<T>(key, root.left, fn);
                }
            } else if (comparison > 0) {
                if (root.right === null) {
                    result = fn(root.key, root.key);

                    if (result !== void 0) { return result; }

                    return this._iterateReverse<T>(key, root.left, fn);
                } else {
                    result = this._iterateReverse<T>(key, root.right, fn);

                    if (result !== void 0) { return result; }

                    result = fn(root.key, root.key);

                    if (result !== void 0) { return result; }

                    return this._iterateReverse<T>(key, root.left, fn);
                }
            } else {
                return fn(root.key, root.key);
            }
        } else {
            return void 0;
        }
    }
}