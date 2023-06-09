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
package org.hyperledger.besu.consensus.qbft;

import org.hyperledger.besu.consensus.common.EpochManager;
import org.hyperledger.besu.consensus.common.bft.BftBlockInterface;
import org.hyperledger.besu.consensus.common.bft.BftContext;
import org.hyperledger.besu.consensus.common.validator.ValidatorProvider;
import org.hyperledger.besu.consensus.qbft.pki.PkiBlockCreationConfiguration;

import java.util.Optional;

/** The Qbft context. */
public class QbftContext extends BftContext {

  private final Optional<PkiBlockCreationConfiguration> pkiBlockCreationConfiguration;

  /**
   * Instantiates a new Qbft context.
   *
   * @param validatorProvider the validator provider
   * @param epochManager the epoch manager
   * @param blockInterface the block interface
   * @param pkiBlockCreationConfiguration the pki block creation configuration
   */
  public QbftContext(
      final ValidatorProvider validatorProvider,
      final EpochManager epochManager,
      final BftBlockInterface blockInterface,
      final Optional<PkiBlockCreationConfiguration> pkiBlockCreationConfiguration) {
    super(validatorProvider, epochManager, blockInterface);
    this.pkiBlockCreationConfiguration = pkiBlockCreationConfiguration;
  }

  /**
   * Gets pki block creation configuration.
   *
   * @return the pki block creation configuration
   */
  public Optional<PkiBlockCreationConfiguration> getPkiBlockCreationConfiguration() {
    return pkiBlockCreationConfiguration;
  }
}
