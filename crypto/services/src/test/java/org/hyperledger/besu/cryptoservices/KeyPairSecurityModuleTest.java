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
package org.hyperledger.besu.cryptoservices;

import org.hyperledger.besu.crypto.ECPointUtil;
import org.hyperledger.besu.crypto.KeyPair;
import org.hyperledger.besu.crypto.KeyPairUtil;
import org.hyperledger.besu.crypto.SECPPublicKey;
import org.hyperledger.besu.crypto.SignatureAlgorithmFactory;

import java.io.File;
import java.io.IOException;
import java.security.spec.ECPoint;

import org.apache.tuweni.bytes.Bytes;
import org.assertj.core.api.Assertions;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

public class KeyPairSecurityModuleTest {

  @Rule public final TemporaryFolder temp = new TemporaryFolder();

  @Test
  public void validatePublicKeyFromECPointCanBeConstructed() throws IOException {
    final File keyDirectory = temp.newFolder();
    final File keyFile = new File(keyDirectory, "key");

    final KeyPair keyPair = KeyPairUtil.loadKeyPair(keyFile);

    final KeyPairSecurityModule keyPairSecurityModule = new KeyPairSecurityModule(keyPair);
    final ECPoint ecPoint = keyPairSecurityModule.getPublicKey().getW();
    final Bytes encodedBytes = ECPointUtil.getEncodedBytes(ecPoint);
    final SECPPublicKey publicKey =
        SignatureAlgorithmFactory.getInstance().createPublicKey(encodedBytes);

    Assertions.assertThat(keyPair.getPublicKey().getEncodedBytes())
        .isEqualByComparingTo(publicKey.getEncodedBytes());
  }
}
