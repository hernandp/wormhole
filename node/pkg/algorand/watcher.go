package algorand

import (
	"context"
	"github.com/certusone/wormhole/node/pkg/common"
)

type (
	// Watcher is responsible for looking over Algorand blockchain and reporting new transactions to the contract
	Watcher struct {
		urlRPC   string
		urlToken string
		contract string

		msgChan chan *common.MessagePublication
		setChan chan *common.GuardianSet
	}
)

type clientRequest struct {
	JSONRPC string `json:"jsonrpc"`
	// A String containing the name of the method to be invoked.
	Method string `json:"method"`
	// Object to pass as request parameter to the method.
	Params [1]string `json:"params"`
	// The request id. This can be of any type. It is used to match the
	// response with the request that it is replying to.
	ID uint64 `json:"id"`
}

// NewWatcher creates a new Algorand contract watcher
func NewWatcher(urlRPC string, urlToken string, contract string, lockEvents chan *common.MessagePublication, setEvents chan *common.GuardianSet) *Watcher {
	return &Watcher{urlRPC: urlToken, contract: contract, msgChan: lockEvents, setChan: setEvents}
}

func (e *Watcher) Run(ctx context.Context) error {
	logger := supervisor.Logger(ctx)
	logger.Info("connecting to algorand RPC", zap.String("url", e.urlRPC))

	readiness.SetReady(common.ReadinessAlgorandSyncing)

	select {}

	return nil
}
