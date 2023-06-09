/*
 * Copyright ConsenSys AG.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
package org.hyperledger.besu.pki;

/** The Pki exception. */
public class PkiException extends RuntimeException {

  private static final long serialVersionUID = 1L;

  /** Instantiates a new Pki exception. */
  public PkiException() {
    super();
  }

  /**
   * Instantiates a new Pki exception.
   *
   * @param message the message
   */
  public PkiException(final String message) {
    super(message);
  }

  /**
   * Instantiates a new Pki exception.
   *
   * @param message the message
   * @param t the Throwable cause
   */
  public PkiException(final String message, final Throwable t) {
    super(message, t);
  }

  /**
   * Instantiates a new Pki exception.
   *
   * @param t the Throwable cause
   */
  public PkiException(final Throwable t) {
    super(t);
  }
}
